import { randomUUID } from 'node:crypto';
export const lanes = [150,350,550];
export class Match {
  constructor(code) { this.code=code; this.phase='lobby'; this.players=[]; this.units=[]; this.bases=[2400,2400]; this.time=0; this.wave=0; this.winner=null; this.nextUnit=0; }
  join(name,team,bot=false) {
    if(this.phase!=='lobby') throw Error('Match already started; reconnect with your saved session.');
    if(![0,1].includes(team)) throw Error('Choose a team.');
    if(this.players.filter(p=>p.team===team).length>=5) throw Error('That team is full.');
    const p={id:randomUUID(),name:String(name||'Wanderer').slice(0,24),team,bot,connected:true,lastSeen:Date.now(),x:team?1080:120,y:lanes[this.players.filter(p=>p.team===team).length%3],hp:180,maxHp:180,level:1,xp:0,kills:0,deaths:0,cd:[0,0,0],attackCd:0,respawn:0,input:{}};
    this.players.push(p); return p;
  }
  fill() { for(const team of [0,1]) while(this.players.filter(p=>p.team===team).length<5) this.join(`Sentinel ${this.players.length+1}`,team,true); }
  start() { if(this.phase!=='lobby') throw Error('Match already started.'); if([0,1].some(t=>this.players.filter(p=>p.team===t&&p.connected).length!==5)) throw Error('Both teams need five connected players. Fill empty seats with bots or invite more players.'); this.phase='playing'; }
  input(p,input) { p.lastSeen=Date.now(); p.connected=true; p.input={x:Math.max(-1,Math.min(1,Number(input.x)||0)),y:Math.max(-1,Math.min(1,Number(input.y)||0)),attack:!!input.attack,ability:[0,1,2].includes(input.ability)?input.ability:null}; }
  hurt(target,damage,source) {
    if(target.hp<=0) return;
    target.hp=Math.max(0,target.hp-damage);
    if(target.hp===0&&source?.maxHp) { source.xp+=target.maxHp?70:16; if(target.maxHp) {source.kills++; target.deaths++; target.respawn=6;} while(source.xp>=source.level*60){source.xp-=source.level*60;source.level++;source.maxHp+=20;source.hp=Math.min(source.maxHp,source.hp+40);} }
  }
  tick(dt=.1,now=Date.now()) {
    for(const p of this.players) if(!p.bot&&now-p.lastSeen>5000) p.connected=false;
    if(this.phase!=='playing') return;
    this.time+=dt; this.wave-=dt;
    if(this.wave<=0){this.wave=8;for(const team of [0,1])for(const y of lanes)for(let i=0;i<3;i++)this.units.push({id:++this.nextUnit,team,x:team?1050+i*18:150-i*18,y,hp:55,cd:0});}
    const all=[...this.players,...this.units];
    for(const p of this.players){
      p.cd=p.cd.map(c=>Math.max(0,c-dt));p.attackCd=Math.max(0,p.attackCd-dt);
      if(p.hp<=0){p.respawn-=dt;if(p.respawn<=0){p.hp=p.maxHp;p.x=p.team?1080:120;p.y=350;}continue;}
      const enemies=all.filter(e=>e.team!==p.team&&e.hp>0);const nearest=enemies.sort((a,b)=>dist(p,a)-dist(p,b))[0];
      let input=p.connected?p.input:{};
      if(p.bot){const tx=nearest?.x??(p.team?70:1130),ty=nearest?.y??p.y;input={x:Math.sign(tx-p.x)*(nearest&&dist(p,nearest)<65?0:1),y:Math.abs(ty-p.y)>12?Math.sign(ty-p.y):0,attack:true,ability:nearest&&dist(p,nearest)<160?0:null};}
      const len=Math.hypot(input.x||0,input.y||0)||1;p.x=clamp(p.x+(input.x||0)/len*150*dt,30,1170);p.y=clamp(p.y+(input.y||0)/len*150*dt,30,670);
      if(input.attack&&p.attackCd<=0){if(nearest&&dist(p,nearest)<90){this.hurt(nearest,20+p.level*3,p);p.attackCd=.55;}else if(Math.hypot(p.x-(p.team?65:1135),p.y-350)<100){this.bases[1-p.team]=Math.max(0,this.bases[1-p.team]-22-p.level*3);p.attackCd=.55;}}
      const a=input.ability;if(a!=null&&p.cd[a]===0){if(a===0){for(const e of enemies)if(dist(p,e)<170)this.hurt(e,40+p.level*4,p);p.cd[0]=4;}if(a===1){p.hp=Math.min(p.maxHp,p.hp+65);p.cd[1]=9;}if(a===2){p.x=clamp(p.x+(input.x|| (p.team?-1:1))*130,30,1170);p.y=clamp(p.y+(input.y||0)*130,30,670);p.cd[2]=6;}}p.input.ability=null;
      if(Math.hypot(p.x-(p.team?1135:65),p.y-350)<100)p.hp=Math.min(p.maxHp,p.hp+25*dt);
    }
    for(const u of this.units){if(u.hp<=0)continue;u.cd-=dt;const target=all.filter(e=>e.team!==u.team&&e.hp>0&&dist(u,e)<85).sort((a,b)=>dist(u,a)-dist(u,b))[0];if(target){if(u.cd<=0){this.hurt(target,7,null);if(target.hp===0&&target.maxHp){target.deaths++;target.respawn=6;}u.cd=1;}}else{const bx=u.team?65:1135;if(Math.abs(u.x-bx)<50){if(Math.abs(u.y-350)>10)u.y+=Math.sign(350-u.y)*65*dt;else if(u.cd<=0){this.bases[1-u.team]=Math.max(0,this.bases[1-u.team]-10);u.cd=1;}}else u.x+=(u.team?-1:1)*65*dt;}}
    this.units=this.units.filter(u=>u.hp>0);
    for(const team of [0,1])if(this.bases[team]<=0){this.phase='finished';this.winner=1-team;}
  }
  snapshot() { return {code:this.code,phase:this.phase,time:this.time,bases:this.bases,winner:this.winner,players:this.players.map(({lastSeen,input,...p})=>p),units:this.units}; }
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
