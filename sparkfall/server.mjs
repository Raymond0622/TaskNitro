import http from 'node:http';
import {randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Match} from './game.mjs';
export function createGameServer(){
 const matches=new Map(),sessions=new Map();
 const server=http.createServer(async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname.startsWith('/api/')){
    let body={};if(req.method==='POST'){let data='';for await(const chunk of req){data+=chunk;if(data.length>4096)throw Error('Request too large.');}body=JSON.parse(data||'{}');}
    const token=req.headers.authorization?.replace('Bearer ','');const session=sessions.get(token);const m=session?.match,p=session?.player;
    let result;
    if(url.pathname==='/api/join'&&req.method==='POST'){
     let match;if(body.code){match=matches.get(String(body.code).toUpperCase());if(!match)throw Error('Lobby not found.');}else{if(matches.size>=100)throw Error('Server lobby capacity reached.');let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(matches.has(code));match=new Match(code);matches.set(code,match);}
     const player=match.join(body.name,body.team);const key=randomBytes(24).toString('hex');sessions.set(key,{match,player});result={token:key,id:player.id,state:match.snapshot()};
    }else{
     if(!session)throw Error('Session expired or missing. Join a lobby.');p.lastSeen=Date.now();p.connected=true;
     if(url.pathname==='/api/state'&&req.method==='GET')result={id:p.id,state:m.snapshot()};
     else if(url.pathname==='/api/input'&&req.method==='POST'){m.input(p,body);result={ok:true};}
     else if(url.pathname==='/api/fill'&&req.method==='POST'){if(m.players[0]!==p)throw Error('Only the lobby host can fill seats.');if(m.phase!=='lobby')throw Error('Match already started.');m.fill();result={state:m.snapshot()};}
     else if(url.pathname==='/api/start'&&req.method==='POST'){if(m.players[0]!==p)throw Error('Only the lobby host can start.');m.start();result={state:m.snapshot()};}
     else throw Error('Unknown action.');
    }
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));return;
   }
   const files={'/':'index.html','/client.js':'client.js','/style.css':'style.css'};const file=files[url.pathname];if(!file){res.writeHead(404);res.end('Not found');return;}
   res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await readFile(new URL(`public/${file}`,import.meta.url)));
  }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}
 });
 let timer;server.on('listening',()=>{timer=setInterval(()=>{const now=Date.now();for(const [code,m] of matches){m.tick(.1,now);if(m.players.filter(p=>!p.bot).every(p=>now-p.lastSeen>30*60*1000)){matches.delete(code);for(const [key,s]of sessions)if(s.match===m)sessions.delete(key);}}},100);});
 server.on('close',()=>clearInterval(timer));return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||3000);createGameServer().listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Sparkfall: http://localhost:${port}`));}
