# Sparkfall — original content and rules

Dawn (cyan) and Dusk (coral) battle on the Threadlands, an original three-lane arena measuring 1200 × 700 units. Both sides have a 2400-HP core. Destroying a core ends the simulation and announces the opposing team as winner. Friendly cores regenerate hero HP at 25/second within 100 units.

Every player controls a Wanderer, an original stick-figure sentinel. Each starts at level 1 with 180 HP and moves at 150 units/second. Basic attacks deal 20 + 3 × level damage within 90 units, every 0.55 seconds. Attacks prioritize the nearest living enemy; if none is in range, an opposing core within 100 units takes 22 + 3 × level damage.

- Q / Pulse: 40 + 4 × level damage to all enemies within 170 units; 4-second cooldown.
- E / Mend: restores up to 65 HP; 9-second cooldown.
- R / Slip: moves 130 units in the input direction, or toward the enemy side when stationary; 6-second cooldown.

Hero kills award 70 XP; minion kills award 16 XP. Each level costs 60 × current level XP, adds 20 maximum HP, restores up to 40 HP, and increases damage through the formulas above. Heroes respawn after six seconds at their home side. The scoreboard records kills and deaths.

Every eight seconds each team spawns three 55-HP minions in each lane. Minions move at 65 units/second, attack opposing units for 7 damage/second within 85 units, and converge at the enemy core to deal 10 damage/second. Bots chase nearby opponents, autoattack and pulse; when no enemies remain they advance toward the enemy core.

The host owns lobby fill and start actions. Start requires exactly five connected participants per team; AI counts as a participant. Humans cannot join after the match starts, but existing session tokens reconnect. Player names are displayed as text, not HTML. Movement, damage, cooldowns, XP, respawn and victory are computed on the server.

No Riot branding, characters, maps, assets, abilities or audio are used. There is no audio in this prototype. All illustration is drawn with Canvas primitives and system fonts.
