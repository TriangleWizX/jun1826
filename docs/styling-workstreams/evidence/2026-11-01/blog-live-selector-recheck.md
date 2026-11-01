# Blog live selector correction audit — 2026-11-01

## Scope and method

- Rechecked the 87 Blog HTML paths from the prior 99-output mapper, excluding the three BJJ-class routes.
- Used read-only HTTP GETs for all 87 pages, then fetched each same-origin CSS file actually referenced by a stylesheet/preload link and same-origin CSS `@import` dependencies.
- Parsed every inline `<style>` block and each fetched live CSS file. Selector matching tolerates whitespace/minification and checks declarations: badge `max-width:100%` plus `white-space:normal`; focus `outline:3px solid ...`, `outline-offset:3px`, and `box-shadow:none`. The matcher was validated against the selector forms supplied in the correction request.
- Candidate CSS paths are taken from the existing audit’s 9-file mapper list. They are listed separately from stylesheets actually linked by current production HTML; a mapper output or 404 response is not counted as a loaded production stylesheet.
- Page responses: 87/87 HTTP 200. Actual linked same-origin CSS: 7 unique URLs, 7/ 7 HTTP 200. Hash capture uses the returned production bytes.
- Selector coverage: badge 71/87; focus 71/87; both 71/87.
- Redirects: 2. Canonical URL differs from final response URL: 0.
- Complete: yes.

## Coverage and missing routes

| Route | HTTP | Final URL | Canonical matches final | Inline badge | Loaded CSS badge | Badge present | Inline focus | Loaded CSS focus | Focus present | SHA-256 |
| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `blog/adult-brazilian-jiu-jitsu-near-me-tannersville` | 200 | `https://senseisandy.com/blog/adult-brazilian-jiu-jitsu-near-me-tannersville` | True | True | — | True | True | — | True | `b5e06b15bef3429355ae80004537b1dab02bc70e46dc9bfd6123b8829de8bd6b` |
| `blog/after-school-jiu-jitsu-calm-routine-catskills` | 200 | `https://senseisandy.com/blog/after-school-jiu-jitsu-calm-routine-catskills` | True | True | — | True | True | — | True | `c734bfd425bd0b51c9affe09db5e2498054f7b848efe5d9afafb86053fb17693` |
| `blog/after-school-jiu-jitsu` | 200 | `https://senseisandy.com/blog/after-school-jiu-jitsu` | True | True | — | True | True | — | True | `1b1b25e237e59fe444feb7f88f92b1ccbdf7386e78629b8514c738f0068eaf5d` |
| `blog/basic-jiu-jitsu-terms` | 200 | `https://senseisandy.com/blog/basic-jiu-jitsu-terms` | True | True | — | True | True | — | True | `cfd586435089f2ac1b6aaf941a9d120cb73583e1f56e1e94924456f89d46f310` |
| `blog/beginner-friendly-bjj-tannersville` | 200 | `https://senseisandy.com/blog/beginner-friendly-bjj-tannersville` | True | True | — | True | True | — | True | `74d9096374009ef32e40332a400f39458720d0bab76f30de7f8bfad48293bea5` |
| `blog/beginners-guide-bjj-human-chess` | 200 | `https://senseisandy.com/blog/beginners-guide-bjj-human-chess` | True | True | — | True | True | — | True | `2ac73d3089af021ee0cb5c5b8c1d4d9258faf53a5e1a258f06375b7e829b21c1` |
| `blog/bio-switch-nervous-system` | 200 | `https://senseisandy.com/blog/bio-switch-nervous-system` | True | True | — | True | True | — | True | `bcea0abbd8db644d0e7ff3060b232a00920e04470d90be0b785f14acf51f5673` |
| `blog/bioginastica-movement-no-gi` | 200 | `https://senseisandy.com/blog/bioginastica-movement-no-gi` | True | True | — | True | True | — | True | `484bb3a0afaab25ab735b7a6a8e2b2e0692972116050020cf3ae564c1be54192` |
| `blog/bjj-36-techniques` | 200 | `https://senseisandy.com/blog/bjj-36-techniques` | True | True | — | True | True | — | True | `b7a73dd48b7e6b7434c922c05a2d7f755e84240580756dcabe1efe78d59baa29` |
| `blog/bjj-beginners-over-40-catskills` | 200 | `https://senseisandy.com/blog/bjj-beginners-over-40-catskills` | True | True | — | True | True | — | True | `a817f5cebfc474846d5182687c30b95454754a0ccceab29ed87d7f11e1c15406` |
| `blog/bjj-belts-stripes-promotions` | 200 | `https://senseisandy.com/blog/bjj-belts-stripes-promotions` | True | True | — | True | True | — | True | `3a10d35b7050f97da26f02f4934299bd62948ee6c806554bc0449ed9cef8664b` |
| `blog/bjj-black-belt-degree-time` | 200 | `https://senseisandy.com/blog/bjj-black-belt-degree-time` | True | True | — | True | True | — | True | `9b0776d27e75c627cc39c21501ec958f988fde5ebc20936a5b2f293c337be2a4` |
| `blog/bjj-on-the-mountain` | 200 | `https://senseisandy.com/blog/bjj-on-the-mountain` | True | True | — | True | True | — | True | `4804e1172ce6ec914da8be499928a64d8432b110145e137d3ecf8f14062eaf2f` |
| `blog/bjj-promotions-how-often` | 200 | `https://senseisandy.com/blog/bjj-promotions-how-often` | True | False | — | False | False | — | False | `e5cc9b62f8a445fbfda21dddaf65c3cc0b3bc746ca6cee5fd692db00811bf11c` |
| `blog/bjj-schedule-windham-ny` | 200 | `https://senseisandy.com/bjj-classes/windham-ny` | True | False | — | False | False | — | False | `ea7e6bda42278ac31147478bc823cca6900da7e572cf45454b519ca7b7ce71dc` |
| `blog/bjj-sensei` | 200 | `https://senseisandy.com/blog/bjj-sensei` | True | True | — | True | True | — | True | `576bebfdbea2023d1b6279594c349dd5a3434c5c3ff497a1a3645718312ac9ee` |
| `blog/bjj-vs-karate-for-kids-catskills` | 200 | `https://senseisandy.com/blog/bjj-vs-karate-for-kids-catskills` | True | True | — | True | True | — | True | `1c935842d85d8976dc4ffc40379082a67daf6132aa26969e9e1b829ca83c23ff` |
| `blog/bjj-vs-taekwondo-family-martial-arts` | 200 | `https://senseisandy.com/blog/bjj-vs-taekwondo-family-martial-arts` | True | True | — | True | True | — | True | `73d0f4f65edb4ed8244d82ce56bfd4b7d54bfda96124501400d6c2b99e6c7b83` |
| `blog/bully-proof-jiu-jitsu-stories-catskills` | 200 | `https://senseisandy.com/blog/bully-proof-jiu-jitsu-stories-catskills` | True | True | — | True | True | — | True | `aca8b44768cd33f0530c02a0a02ffff3c86ddb2284b59e14b5313e3d995cdde3` |
| `blog/bully-proof-martial-arts-tannersville` | 200 | `https://senseisandy.com/blog/bully-proof-martial-arts-tannersville` | True | True | — | True | True | — | True | `c8a1c47e85fa43e2f530cb45bcd5e4639871fa430024337b388bea45c6630dcc` |
| `blog/busy-parent-guide-to-family-martial-arts` | 200 | `https://senseisandy.com/blog/busy-parent-guide-to-family-martial-arts` | True | True | — | True | True | — | True | `8ab7cf1c9b39b5abd953e329eacc084f025245947e21370091ef4cbd4e3bf4c2` |
| `blog/cairo-ny-bjj-specialist` | 200 | `https://senseisandy.com/blog/cairo-ny-bjj-specialist` | True | False | — | False | False | — | False | `4414b94c20b76e74ab73f3e1be3e2032a4b2ba76121e5a47675d9713492c399b` |
| `blog/can-you-beat-sensei-without-a-black-belt` | 200 | `https://senseisandy.com/blog/can-you-beat-sensei-without-a-black-belt` | True | True | — | True | True | — | True | `953d55a78472e4910595b053c5c3844ab33f41f57c2511ed093b7a047063b264` |
| `blog/catskills-gym-alternative-jiu-jitsu` | 200 | `https://senseisandy.com/blog/catskills-gym-alternative-jiu-jitsu` | True | True | — | True | True | — | True | `07f086b95299789d3098c5b10c2e53224bda195c8ab85c804a65e8206ec08416` |
| `blog/confidence-protocol` | 200 | `https://senseisandy.com/free-bjj-intro-tannersville-ny` | True | False | — | False | False | — | False | `b9fb9964732437d4f2d5f6ef8e47765367ac969882c5daa440e5e91e2a7bdaca` |
| `blog/cost-of-private-bjj-lessons-catskills` | 200 | `https://senseisandy.com/blog/cost-of-private-bjj-lessons-catskills` | True | True | — | True | True | — | True | `61d30cc6f2b3506cddcb351efeb548bc2c4277c3c9211964f56b284d55c3433d` |
| `blog/desk-worker-bjj-guide-mobility-core-calm` | 200 | `https://senseisandy.com/blog/desk-worker-bjj-guide-mobility-core-calm` | True | True | — | True | True | — | True | `b56237f3232fa67cd16ed7ed9fcc81d99b1db3eb38483b9baf313cf7d6fd528c` |
| `blog/exactly-what-happens-first-bjj-class-minute-by-minute` | 200 | `https://senseisandy.com/blog/exactly-what-happens-first-bjj-class-minute-by-minute` | True | True | — | True | True | — | True | `6945e31e99c0dac188f713425b6bcd136f3c9debd477f654314c3c02c2a5225d` |
| `blog/family-friendly-bjj-near-tannersville` | 200 | `https://senseisandy.com/blog/family-friendly-bjj-near-tannersville` | True | True | — | True | True | — | True | `bef161486bf3c6bf9eb8bf68f868fe7944ecc2a2203cfc20b5c911523d5b3dd5` |
| `blog/family-martial-arts-catskills` | 200 | `https://senseisandy.com/blog/family-martial-arts-catskills` | True | True | — | True | True | — | True | `5bb60c8d5acd1ee5c70ec6bd001be49817b20315f80e07f4a5c60963f0267c13` |
| `blog/gain-points-system` | 200 | `https://senseisandy.com/blog/gain-points-system` | True | True | — | True | True | — | True | `431b26d87d68017d351d18e60a7ad5c35d451ee0eff4fb0dbd76c197fe5ece93` |
| `blog/gi-bjj-windham-ny` | 200 | `https://senseisandy.com/blog/gi-bjj-windham-ny` | True | True | — | True | True | — | True | `8d23b758967f54e986ab2587ba2e0930a67e30bd47104f6867cdc88e93165fc8` |
| `blog/gi-vs-no-gi-bjj-cheat-code` | 200 | `https://senseisandy.com/blog/gi-vs-no-gi-bjj-cheat-code` | True | True | — | True | True | — | True | `da0950cf39dec4aee6dd721cfe1f26bca03ff219a7fc47f4aa699f4afff3909b` |
| `blog/growth-over-gold-bjj-mindset` | 200 | `https://senseisandy.com/blog/growth-over-gold-bjj-mindset` | True | True | — | True | True | — | True | `d10f717b8f8826759c6338a372ae4a9c7e46ed8b207b704b525e559e9df87893` |
| `blog/how-sandy-teaches-bjj` | 200 | `https://senseisandy.com/blog/how-sandy-teaches-bjj` | True | True | — | True | True | — | True | `d279a6523375035176de0bb23ca401ade6be23a6aa58b0e5ac7dd446e84ede7d` |
| `blog/how-to-fall-safely-bjj-breakfalls` | 200 | `https://senseisandy.com/blog/how-to-fall-safely-bjj-breakfalls` | True | True | — | True | True | — | True | `0806982fae3ad1fe930dac6142f2094981760c5cd88bc61b6435cda858a28495` |
| `blog/how-to-pick-a-bjj-school-in-the-catskills` | 200 | `https://senseisandy.com/blog/how-to-pick-a-bjj-school-in-the-catskills` | True | True | — | True | True | — | True | `55979a07a371361e5fbb43fb27a82185db555612db9e2d9c71a573a9282810d8` |
| `blog/hunter-elementary-tuesday-drop-off-bjj` | 200 | `https://senseisandy.com/blog/hunter-elementary-tuesday-drop-off-bjj` | True | True | — | True | True | — | True | `5d9ac32fd4e95b0ac1ca598536899394aa9d480fa77c16841dcfa6cff11bbbf0` |
| `blog` | 200 | `https://senseisandy.com/blog` | True | True | — | True | True | — | True | `9ec3f2a5c1fb57dfe48d98a5575d640e4d5a4bef968a522221287c0496c478e2` |
| `blog/jiu-jitsu-for-teenagers-catskills` | 200 | `https://senseisandy.com/blog/jiu-jitsu-for-teenagers-catskills` | True | True | — | True | True | — | True | `f39abe6ac829f7baee065b8cdd0724e61c49db19ea30bb106bead5196b66d042` |
| `blog/jiu-jitsu-near-hunter-mountain` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain` | True | False | — | False | False | — | False | `08131e772e0df4f0a17d1287b539ff074459fc86d491c528eb2b7f3170985496` |
| `blog/jiu-jitsu-near-windham-mountain-club-ski-families` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families` | True | False | — | False | False | — | False | `f9f8b4fc7c336bb49c05b2de0e71717c034967734edd6c087ec092d002caeb6b` |
| `blog/jiu-jitsu-near-windham-mountain-club` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club` | True | False | — | False | False | — | False | `6393ff54d83d8e9b5027fd267ed4c8ed6de15f1cc16fff0908a0149bc67eda50` |
| `blog/jiu-jitsu-windham-ny` | 200 | `https://senseisandy.com/blog/jiu-jitsu-windham-ny` | True | True | — | True | True | — | True | `b4e2dd14087fcf9bedec77761882cbb2364ff8218a7821ce9e5d13c313a41545` |
| `blog/kids-bjj-training-partners` | 200 | `https://senseisandy.com/blog/kids-bjj-training-partners` | True | True | — | True | True | — | True | `04f520baa5544d6b86045b0962bee268b7c3a7ed1cb975c7e887aadd24abdf9a` |
| `blog/kids-jiu-jitsu-windham-ny` | 200 | `https://senseisandy.com/blog/kids-jiu-jitsu-windham-ny` | True | True | — | True | True | — | True | `8a2bd5cb0497d0db2242b853d655ad345bc3dd48d8b916f63d3e5e3ba0fed576` |
| `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu` | 200 | `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu` | True | False | — | False | False | — | False | `a7c515218684ff05f8e41620b6e773512f2f4299250ce19d0c8fa96da511da6e` |
| `blog/kids-martial-arts-haines-falls` | 200 | `https://senseisandy.com/blog/kids-martial-arts-haines-falls` | True | False | — | False | False | — | False | `f2371ad473c1c15822c48422dabe2abf0fa78bc23d3476784af61afbb4b1bfff` |
| `blog/kids-teens-bjj-belts-ranks-stripes-promotions` | 200 | `https://senseisandy.com/blog/kids-teens-bjj-belts-ranks-stripes-promotions` | True | True | — | True | True | — | True | `5ed4fd6bfc0bef493222f42e22f7814c592b22bd217b7536d1aecb9217c7370d` |
| `blog/kinetic-chess-onteora-park` | 200 | `https://senseisandy.com/blog/kinetic-chess-onteora-park` | True | True | — | True | True | — | True | `9d0a7bb66573a3d58f7eef895c29609dbb248faef602d9b25ee9acee34759350` |
| `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu` | 200 | `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu` | True | False | — | False | False | — | False | `021bf7d8743f324cd5d3e817ba06edeeb4d89682eaa3d05befcd002f2ff982a2` |
| `blog/neck-cranks-bjj-longevity-guide` | 200 | `https://senseisandy.com/blog/neck-cranks-bjj-longevity-guide` | True | True | — | True | True | — | True | `ead07f47f81a75721d2100310c65426a72d563c573b5241a6a81fd65298ef569` |
| `blog/no-gi-windham-ny` | 200 | `https://senseisandy.com/blog/no-gi-windham-ny` | True | True | — | True | True | — | True | `81f9e757ad1b76d91110a183bac7986f6e1cd7ffcc16b03df0f8811acdbea8e4` |
| `blog/private-bjj-coaching-catskills-visitors` | 200 | `https://senseisandy.com/blog/private-bjj-coaching-catskills-visitors` | True | True | — | True | True | — | True | `449b1d232dc5ad318f56b0a631d8aa04971884abf104f1bddd23a8d73f97d212` |
| `blog/private-bjj-lessons-adults-catskills` | 200 | `https://senseisandy.com/blog/private-bjj-lessons-adults-catskills` | True | True | — | True | True | — | True | `47dfe283334fe4f7cb24bdc293fb26148e79f97f81d15cd80ef99c0ecc0d0fc6` |
| `blog/private-bjj-lessons-kids-tannersville` | 200 | `https://senseisandy.com/blog/private-bjj-lessons-kids-tannersville` | True | True | — | True | True | — | True | `fbb6de13a3110089d96a622cdb0911d8907546afbb950f3c3e6d89391151fa30` |
| `blog/private-jiu-jitsu-lessons-windham-ny` | 200 | `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny` | True | False | — | False | False | — | False | `c3eb1836c61aae95ac698334e3a2fdccab266fa2f03468e8ab48d8ce2369a6a6` |
| `blog/private-self-defense-coaching-tannersville` | 200 | `https://senseisandy.com/blog/private-self-defense-coaching-tannersville` | True | True | — | True | True | — | True | `35d81698256c4c745eadab490d8ce23f0bd80ec99e5ac6787c4e24cc40e9d0e5` |
| `blog/safe-bjj-mma-training-tannersville` | 200 | `https://senseisandy.com/blog/safe-bjj-mma-training-tannersville` | True | True | — | True | True | — | True | `66ba77b4cbd797300a3094eb3b880568ef7fcaf29695de3b0740b9f27c6c35a0` |
| `blog/safe-martial-arts-beginners-catskills` | 200 | `https://senseisandy.com/blog/safe-martial-arts-beginners-catskills` | True | True | — | True | True | — | True | `6e689fcbe1379a82c1062e5a8a5c5050ae496b78fa09e00f808ea4db4c494e98` |
| `blog/safe-self-defense-kids-positional-control` | 200 | `https://senseisandy.com/blog/safe-self-defense-kids-positional-control` | True | True | — | True | True | — | True | `c4481838b0b6c67eac4cb1a1e62e4f60077ccc1f652e156f4cc0cf20d8672df6` |
| `blog/sanda-vs-jiu-jitsu-for-mma` | 200 | `https://senseisandy.com/blog/sanda-vs-jiu-jitsu-for-mma` | True | True | — | True | True | — | True | `6a26d32c13535ca8fcdbbc4b55715f0dcf67d4a4269aa3780f386c500b2ef155` |
| `blog/sanda-vs-jiu-jitsu` | 200 | `https://senseisandy.com/blog/sanda-vs-jiu-jitsu` | True | True | — | True | True | — | True | `4855c2556be7ab7f35befb4f668d3e16d5b138fe34716572f264c90b165cd914` |
| `blog/schedule-sensei-reset-protocol` | 200 | `https://senseisandy.com/blog/schedule-sensei-reset-protocol` | True | True | — | True | True | — | True | `280a9160c70b5fe4fcb4444abf9abae87402d416f8513ec6f646977a5b80140d` |
| `blog/schedule-sensei-weekly-template` | 200 | `https://senseisandy.com/blog/schedule-sensei-weekly-template` | True | False | — | False | False | — | False | `21e4d2da846bd754aea5adafc9211b514850ab31753cbea9c4bd11d9759d5c8e` |
| `blog/schedule-sensei` | 200 | `https://senseisandy.com/blog/schedule-sensei` | True | False | — | False | False | — | False | `33c5b2ce9782cf6eac1961664deb335e69e0d276657718ba4162e3e4aaa0da89` |
| `blog/seated-guard-basics` | 200 | `https://senseisandy.com/blog/seated-guard-basics` | True | True | — | True | True | — | True | `7fc73ad4ce49452db456d73938d6e457e725595a00ae0f66393d79142d96e0f9` |
| `blog/sensei-mma-bjj` | 200 | `https://senseisandy.com/blog/sensei-mma-bjj` | True | True | — | True | True | — | True | `23d0b139776e4fcae3d65e1da81ce0ec9f6b1bbadd8b742562574a2d6ee96e97` |
| `blog/sensei-rules` | 200 | `https://senseisandy.com/blog/sensei-rules` | True | True | — | True | True | — | True | `1624e591fbfb88b0e63745de03717a21f03ceb3b7961bf86d67581712b33638f` |
| `blog/snow-day-protocol-bjj-home-dojo` | 200 | `https://senseisandy.com/blog/snow-day-protocol-bjj-home-dojo` | True | True | — | True | True | — | True | `c74ed0d01867d0bee9a2dfd1af8dadde55c5afcd5f98d212279da74c29cadae3` |
| `blog/spring-fling-is-here` | 200 | `https://senseisandy.com/blog/spring-fling-is-here` | True | True | — | True | True | — | True | `4baeaea11977f844007961c22ac8e97530a5dc24218cf6ff7bfe6e271e993c9b` |
| `blog/starting-bjj-over-30-over-40-catskills` | 200 | `https://senseisandy.com/blog/starting-bjj-over-30-over-40-catskills` | True | True | — | True | True | — | True | `b52bb78a013132a9d037d02486f97db33260102bdcc4cfd5e4aa1d228d6c7906` |
| `blog/tags/adult-bjj` | 200 | `https://senseisandy.com/blog/tags/adult-bjj` | True | True | — | True | True | — | True | `06df221afdc308f37787fb8c2e8f0e3cf529ad272dec5f71afc19d87c96039e0` |
| `blog/tags/starting-jiu-jitsu` | 200 | `https://senseisandy.com/blog/tags/starting-jiu-jitsu` | True | True | — | True | True | — | True | `004ec46512f5ef31245c8724c2073eb82ba21dbc0ba6500fb3e89585ac30c3ce` |
| `blog/tags/youth` | 200 | `https://senseisandy.com/blog/tags/youth` | True | True | — | True | True | — | True | `a3f8ec4c6df9a8445083a946eb791e4c35a2481a705386c8e59b75c18646378f` |
| `blog/takedown-defense` | 200 | `https://senseisandy.com/blog/takedown-defense` | True | True | — | True | True | — | True | `d068caa39f81549a01efcd951251af62b493369880d84124ae2f257da26f0f68` |
| `blog/tannersville-bjj-tuesday` | 200 | `https://senseisandy.com/blog/tannersville-bjj-tuesday` | True | False | — | False | False | — | False | `c3777bf05896d563c31151786c1f6b0886aede6b87679819c920705bb985d252` |
| `blog/teen-boundary-setting-conflict-deescalation` | 200 | `https://senseisandy.com/blog/teen-boundary-setting-conflict-deescalation` | True | True | — | True | True | — | True | `ba51326ab57729d5a8fabd27d45c6c3e1b43ce59daf675e22b5c230f4d53e82d` |
| `blog/teen-confidence-deescalation-jiu-jitsu` | 200 | `https://senseisandy.com/blog/teen-confidence-deescalation-jiu-jitsu` | True | True | — | True | True | — | True | `0825a51cec010f6d5aee479be45bcda8f7dd40388c48055289a8a42af6f219a5` |
| `blog/teen-jiu-jitsu-hunter-ny` | 200 | `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny` | True | False | — | False | False | — | False | `dd1a38d5502a51515b9aa411606f3f3281359367edeba5cf1b3c9811eea0db61` |
| `blog/things-to-do-near-hunter-ny-private-bjj-coaching` | 200 | `https://senseisandy.com/blog/things-to-do-near-hunter-ny-private-bjj-coaching` | True | True | — | True | True | — | True | `591ffe181245a164c699994ac880f573537a103487288344923e99f5be681ff0` |
| `blog/water-before-training-how-much-when` | 200 | `https://senseisandy.com/blog/water-before-training-how-much-when` | True | True | — | True | True | — | True | `e50c8eba616d21400ee510e48c1d8e226ffc476a83d455799b97bce39ffd7c4c` |
| `blog/what-does-sensei-mean-in-bjj` | 200 | `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj` | True | False | — | False | False | — | False | `c951aee3cb3c9343d0b6a2e05b4c91e529345b997ead5cde61aa45ca26b32568` |
| `blog/what-is-sanda-sanshou` | 200 | `https://senseisandy.com/blog/what-is-sanda-sanshou` | True | True | — | True | True | — | True | `41c2d8700ceb6e22492b4cd63c9725929fd983c47680ea2cfb7103b89f534dbe` |
| `blog/what-kids-learn-in-bjj` | 200 | `https://senseisandy.com/blog/what-kids-learn-in-bjj` | True | True | — | True | True | — | True | `b70b0faae05e5ba23be1cd3f6fb24ede8c3a33978628297baf806788d9c03db0` |
| `blog/why-high-school-athletes-train-bjj-tannersville` | 200 | `https://senseisandy.com/blog/why-high-school-athletes-train-bjj-tannersville` | True | True | — | True | True | — | True | `7cd581042553aebe3851d230a13bf710cc2cab3b16eac6bc83de5ea32f26c21d` |
| `blog/wrestle-ups-scramble` | 200 | `https://senseisandy.com/blog/wrestle-ups-scramble` | True | True | — | True | True | — | True | `8ba5e83d894cff6e8e10577414d479754b067f1585c2271d142fff78e251b864` |

### Routes missing the badge-wrap rule

- `blog/bjj-promotions-how-often` (HTTP 200; final `https://senseisandy.com/blog/bjj-promotions-how-often`; canonical `https://senseisandy.com/blog/bjj-promotions-how-often`).
- `blog/bjj-schedule-windham-ny` (HTTP 200; final `https://senseisandy.com/bjj-classes/windham-ny`; canonical `https://senseisandy.com/bjj-classes/windham-ny`).
- `blog/cairo-ny-bjj-specialist` (HTTP 200; final `https://senseisandy.com/blog/cairo-ny-bjj-specialist`; canonical `https://senseisandy.com/blog/cairo-ny-bjj-specialist`).
- `blog/confidence-protocol` (HTTP 200; final `https://senseisandy.com/free-bjj-intro-tannersville-ny`; canonical `https://senseisandy.com/free-bjj-intro-tannersville-ny`).
- `blog/jiu-jitsu-near-hunter-mountain` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain`).
- `blog/jiu-jitsu-near-windham-mountain-club-ski-families` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families`).
- `blog/jiu-jitsu-near-windham-mountain-club` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club`).
- `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu` (HTTP 200; final `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu`; canonical `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu`).
- `blog/kids-martial-arts-haines-falls` (HTTP 200; final `https://senseisandy.com/blog/kids-martial-arts-haines-falls`; canonical `https://senseisandy.com/blog/kids-martial-arts-haines-falls`).
- `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu` (HTTP 200; final `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu`; canonical `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu`).
- `blog/private-jiu-jitsu-lessons-windham-ny` (HTTP 200; final `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny`; canonical `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny`).
- `blog/schedule-sensei-weekly-template` (HTTP 200; final `https://senseisandy.com/blog/schedule-sensei-weekly-template`; canonical `https://senseisandy.com/blog/schedule-sensei-weekly-template`).
- `blog/schedule-sensei` (HTTP 200; final `https://senseisandy.com/blog/schedule-sensei`; canonical `https://senseisandy.com/blog/schedule-sensei`).
- `blog/tannersville-bjj-tuesday` (HTTP 200; final `https://senseisandy.com/blog/tannersville-bjj-tuesday`; canonical `https://senseisandy.com/blog/tannersville-bjj-tuesday`).
- `blog/teen-jiu-jitsu-hunter-ny` (HTTP 200; final `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny`; canonical `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny`).
- `blog/what-does-sensei-mean-in-bjj` (HTTP 200; final `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj`; canonical `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj`).

### Routes missing the visible-focus rule

- `blog/bjj-promotions-how-often` (HTTP 200; final `https://senseisandy.com/blog/bjj-promotions-how-often`; canonical `https://senseisandy.com/blog/bjj-promotions-how-often`).
- `blog/bjj-schedule-windham-ny` (HTTP 200; final `https://senseisandy.com/bjj-classes/windham-ny`; canonical `https://senseisandy.com/bjj-classes/windham-ny`).
- `blog/cairo-ny-bjj-specialist` (HTTP 200; final `https://senseisandy.com/blog/cairo-ny-bjj-specialist`; canonical `https://senseisandy.com/blog/cairo-ny-bjj-specialist`).
- `blog/confidence-protocol` (HTTP 200; final `https://senseisandy.com/free-bjj-intro-tannersville-ny`; canonical `https://senseisandy.com/free-bjj-intro-tannersville-ny`).
- `blog/jiu-jitsu-near-hunter-mountain` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain`).
- `blog/jiu-jitsu-near-windham-mountain-club-ski-families` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families`).
- `blog/jiu-jitsu-near-windham-mountain-club` (HTTP 200; final `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club`; canonical `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club`).
- `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu` (HTTP 200; final `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu`; canonical `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu`).
- `blog/kids-martial-arts-haines-falls` (HTTP 200; final `https://senseisandy.com/blog/kids-martial-arts-haines-falls`; canonical `https://senseisandy.com/blog/kids-martial-arts-haines-falls`).
- `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu` (HTTP 200; final `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu`; canonical `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu`).
- `blog/private-jiu-jitsu-lessons-windham-ny` (HTTP 200; final `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny`; canonical `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny`).
- `blog/schedule-sensei-weekly-template` (HTTP 200; final `https://senseisandy.com/blog/schedule-sensei-weekly-template`; canonical `https://senseisandy.com/blog/schedule-sensei-weekly-template`).
- `blog/schedule-sensei` (HTTP 200; final `https://senseisandy.com/blog/schedule-sensei`; canonical `https://senseisandy.com/blog/schedule-sensei`).
- `blog/tannersville-bjj-tuesday` (HTTP 200; final `https://senseisandy.com/blog/tannersville-bjj-tuesday`; canonical `https://senseisandy.com/blog/tannersville-bjj-tuesday`).
- `blog/teen-jiu-jitsu-hunter-ny` (HTTP 200; final `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny`; canonical `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny`).
- `blog/what-does-sensei-mean-in-bjj` (HTTP 200; final `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj`; canonical `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj`).

## Candidate CSS outputs vs production-loaded CSS

Production-loaded CSS below comes only from live page stylesheet/preload links and their same-origin imports. Candidate outputs come from the prior mapper list; their presence in that list does not mean production HTML loads them.

| Candidate mapped CSS output | Referenced by live Blog HTML | Live fetch | Production-loaded source |
| --- | ---: | --- | --- |
| `assets/css/blog.cc6577.css` | 0/87 | not requested by live pages | no |
| `assets/css/blog.css` | 0/87 | not requested by live pages | no |
| `assets/css/blog.min.css` | 0/87 | not requested by live pages | no |
| `assets/css/pages/adults-delivery.b64270844d52.css` | 0/87 | not requested by live pages | no |
| `assets/css/pages/article-delivery.d7324c9b8349.css` | 0/87 | not requested by live pages | no |
| `assets/css/pages/kids-delivery.21fed56d05d6.css` | 0/87 | not requested by live pages | no |
| `assets/css/pages/teens-delivery.767b2c0c453d.css` | 0/87 | not requested by live pages | no |
| `assets/css/routes/site-adults-delivery.d027512ba43b.css` | 0/87 | not requested by live pages | no |
| `assets/css/routes/site-teens-delivery.d70b69057bb2.css` | 0/87 | not requested by live pages | no |

### Production stylesheet fetches

| Production stylesheet URL | HTTP | Bytes | SHA-256 | Badge rule | Focus rule |
| --- | ---: | ---: | --- | --- | --- |
| `https://senseisandy.com/assets/css/bootstrap-icons-local.6444e2.css` | 200 | 13422 | `d749fbf58f65a1586a6f73efd299a46ac0990d26d95b45ac6d3f7880c2c0b4e7` | False | False |
| `https://senseisandy.com/assets/css/fonts.min.5ee9a4.css` | 200 | 769 | `68bf0445fb523bfe0b835a338e5af2aa2e056209198269cfd4ef2775c4f2719d` | False | False |
| `https://senseisandy.com/assets/css/mobile-foundation.114422.css` | 200 | 4430 | `4414af7111252cd81e95a48661a77641b5dc9c8ec8784beb6c858bc60ce76b6e` | False | False |
| `https://senseisandy.com/assets/css/pages/sensei-jiu-jitsu.min.9af938.css` | 200 | 5659 | `91bfd27325089e974c21edafd8536e144b320ec9053f1f753cae160bf2bdfaed` | False | False |
| `https://senseisandy.com/assets/css/routes/site-18ac9c2704ce.min.css` | 200 | 60939 | `5bbf55070bc10a001a3e57374245f6ad1d4292b82a8caa856be7b5b34b3f588f` | False | False |
| `https://senseisandy.com/assets/css/site-shell.min.7f177f.css` | 200 | 41491 | `35ba53d00ccf2cf62e703681bceb20fa0af2c6c6d252529e4f072741675bf150` | False | False |
| `https://senseisandy.com/tokens.40ed4d.css` | 200 | 1459 | `58cabd04bf01b7d568c52564bb78fac7d0f17fbae9ea3516caef6cbfb12de563` | False | False |

## Redirects and canonical differences

- `blog/bjj-schedule-windham-ny`: requested `/blog/bjj-schedule-windham-ny/`; final `https://senseisandy.com/bjj-classes/windham-ny`; canonical `https://senseisandy.com/bjj-classes/windham-ny`.
- `blog/confidence-protocol`: requested `/blog/confidence-protocol/`; final `https://senseisandy.com/free-bjj-intro-tannersville-ny`; canonical `https://senseisandy.com/free-bjj-intro-tannersville-ny`.

## Result

Production selector detection is based on actual inline style blocks and currently linked production stylesheets, not on candidate mapper outputs or unreferenced URLs. Candidate fingerprints returning 404 are not counted as active production CSS. This report is a read-only selector verification; it does not change the prior release-payload hold.

| Failure / incomplete request | Count |
| --- | ---: |
| Blog HTML GET failure/non-200 | 0 |
| Linked same-origin CSS GET failure/non-200 | 0 |

## Completeness correction — 2026-11-01

The route table above contained 86 rows although the mapped Blog HTML set contains 87 pages. The omitted route was `blog/index.html`. A focused live GET to `https://senseisandy.com/blog/` returned HTTP 200, resolved to `/blog`, and returned 263,190 bytes with SHA-256 `9ec3f2a5c1fb57dfe48d98a5575d640e4d5a4bef968a522221287c0496c478e2`. Its inline styles contain both the badge-wrap and button-focus rules. The existing clean-build route audit also records this route's content similarity and asset-reference comparison at `2026-11-01-blog-current-route-audit.md`.

With that route included, coverage is 71/87 for each rule and 71/87 for both. Sixteen routes lack the rules. The audit table still lists only the original 86 route rows; this note supplies the missing route evidence. The selector result does not clear deployment: the clean-build audit found route content/asset-reference drift, and current root `dist/` remains mixed.
