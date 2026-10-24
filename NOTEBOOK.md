# Class Notebook: Neighborly

Akshit · Matriculation no. 21411674

## Entry: Neighbor food sharing (version 1)

**Date:** 04/10/2026
**Brief I drew:** *Neighbor food sharing.* "Someone with surplus food from a party or garden needs to give it away before it spoils, while there's no quick way to tell nearby neighbors it's available."

### What I built
**Neighborly** is a web app where neighbors post extra food and others claim it before it spoils. It has 5 sections: Home, Discover (a feed with search and filters), Share (a post form), Claims (what I reserved and what I shared), and Profile.

### Who it's for
People living in the same building or street. Givers have party leftovers or garden extras. Takers are neighbors who'd happily use them.

### How I chose this idea
I drew two briefs: this one and a secondhand bike marketplace. I picked food sharing because it's an **everyday** problem. People have extra food every week, but buy a used bike rarely, so the app would get used more often.

### Key design decisions
- **An app, not just a WhatsApp message maker.** My first idea was a tool that formats a food post for the building's WhatsApp group. I changed direction because group chats are noisy and a food post gets buried within an hour, so people miss it. A dedicated feed (and later, notifications) solves the real problem in the brief: *telling* neighbors quickly.
- **Allergens and freshness come first.** This is food from strangers, so every post shows a "made at" time, a countdown, and allergen tags (nuts, dairy, gluten, egg). Users can save their own allergies in their profile, and the app warns them on matching food.
- **Countdowns.** The brief says "before it spoils," so every post has an end time and turns orange or red as it gets close.
- **Pickup spot instead of exact location or distance.** It's safer (no flat numbers or GPS), and it's how sharing in a building actually works: "table by the mailboxes."
- **Portions.** Takers claim only what they need (e.g., 2 of 6 portions), so one person doesn't take everything.
- **"Give it back" button.** If someone can't make it, the food goes back to the feed instead of being wasted.
- **Works on phone and desktop.** Bottom tabs on phones, a top menu and a card grid on laptops.
- **Design inspiration:** I made a reference mockup and combined it with my own planning. I kept its look (cream and green, leaf logo, 5 tabs), but removed features that need accounts (ratings, chat) and added the safety features above.

### How I built it
- Vibe-coded with Claude: I described the idea, reviewed mockups, picked a design direction, then had it write the code.
- One `index.html` file: HTML, CSS and plain JavaScript, no frameworks.
- All saving and loading lives in one `DB` section of the code, so it can be swapped for a real database later without rewriting the screens.

### Honest limitations (version 1)
- Posts are saved **in this browser only** (localStorage). Other people don't see my posts yet. The sample posts show how the shared feed will look.
- No accounts and no notifications yet.

---

## Entry: Accounts, buildings and a shared database (version 2)

**Date:** 24 October 2026

### What changed and why
Version 1 only worked on one device, so neighbors could not actually share anything. Version 2 makes Neighborly a real shared app: people sign up, join their building, and see the same live feed. The changes also come from my three context-mapping interviews (two people who already knew the app, one who did not).

### Main goal
Neighbors throw away good food because there is no quick, trusted way to offer it to the people next door. Neighborly gives a building one place to say "I have extra food, come and get it before it spoils", with enough safety information (ingredients, allergens, time) that a stranger can decide whether to eat it.

### Key design decisions
- **Anyone can look, an account is needed to act.** Guests can browse the feed, but the pickup spot and the giver's name stay hidden until login. Claiming and posting need an account with a confirmed email.
- **Sign-up is email and password only,** with a checkbox: "I'll only share food I would eat myself, and I understand food is shared at my own risk." Email confirmation is done with a real link from Firebase.
- **Buildings work with a code, not a zip code or a 5 km radius.** A zip code or radius would mix up different buildings and share information with people who are not neighbors. A code like `K7PM-4TQ2` means only people who were given it can join. The first person creates the building and becomes the admin. The admin can make a new code, edit the pickup spots and remove a member. One account belongs to one building, and a person can leave and join another.
- **Pickup spots are chosen by the admin,** and givers choose from the list or type "Other". This keeps flat numbers out of posts.
- **Safety from the interviews.** Ingredients are required. The giver must answer the allergen question explicitly. A "contains meat" tag exists. The form warns when the ingredients mention an allergen that was not ticked, and it blocks "vegan" when the ingredients contain dairy, egg or meat. Neighbors can use a "Safe for me" filter. Only first names are shown. Every post has a "Report this post" button.
- **Fixes from my usability self-evaluation (Nielsen heuristics).** Clear "You claimed 2 portions" text, Undo and Edit on posts, a back button that returns to the previous screen, a "Soon" label on the notification bell, no "made at" times in the future, an "Until tomorrow 12:00" label, and no false "neighbors can see it now" message.
- **Animated 3D hero on the home screen** (Three.js). It stops when it is off screen, when the tab is hidden, and when I leave Home. It shows a static version for reduced-motion settings, data-saver mode, no WebGL, or when loading fails. The Firebase code is also loaded only when needed, so the page starts fast.
- **I kept the leaf logo** after comparing it with a tree and a house idea.
- **Things I decided not to build now:** the "plan-ahead plate" idea, Impressum and privacy pages (not needed for a course project), German language (maybe later).

### How I built it
- **Phase A: all screens first, with a demo backend** that saves in the browser. This let me test every flow (sign-up, verify, join, post, claim, undo, report) before touching a database.
- **Phase B: Firebase** (free Spark plan, database in Frankfurt, EU).
  - *Authentication* handles sign-up, login, email confirmation and password reset, so I never handle passwords myself.
  - *Firestore* stores users, buildings, posts, claims and reports, and updates every neighbor's screen live.
  - *Security rules* decide who can read and write. A person can only see posts of their own building, only the owner can edit a post, only members of the building can claim, and a join code must be known to join. Claiming runs as a transaction, so two neighbors can never take the same last portion.
  - Because the screens only talk to `Auth` and `DB`, I replaced the demo backend with the Firebase one without rewriting the screens, as planned in version 1.
- Still plain HTML, CSS and JavaScript in one `index.html`, plus `hero3d.js`. Libraries: Three.js (hero) and Firebase (accounts and data), both loaded from a CDN with a fixed version.

### Testing
- Automated browser tests (headless Chromium) on phone and desktop sizes: 191 checks on the demo version, and 135 checks on the Firebase version against a simulated Firebase. They cover guest limits, sign-up errors, verification, joining, building isolation, claiming, undo, reports, password reset, no sideways scrolling, and no console errors.
- Manual test on the live site with two real accounts on two devices: sign-up, email link, building code, posting, claiming and live updates all worked.
- Not tested: the security rules were checked by reading them, not with Firebase's emulator, and I have not tried many different phones.

### Honest limitations (version 2)
- Any member of a building could technically change the "portions left" number of someone else's post, because stopping that needs Cloud Functions, which need the paid Firebase plan.
- No notifications yet, English only, and no privacy notice or Impressum, so it is not ready for a public launch.
- Photos are small and stored inside the post, because the free plan has no extra file storage.
- The free plan has daily limits (about 50,000 reads and 20,000 writes per day). That is enough for a few buildings, but not for a big launch.
- No ratings or chat with the giver.

### Roadmap
- **Version 3:** notifications when new food is posted in my building (web push or ntfy).
- **Before a real launch:** privacy notice, Impressum, German language, and a performance and accessibility check (Lighthouse).
- **Later:** installable app (PWA), ratings, and chat with the giver.

### Problems & how I solved them
- **Firebase project ID had a number added** (`neighborly-528d2`). Project IDs must be unique across Google, so this is normal. Users never see it.
- **I turned on "Email link (passwordless sign-in)" by mistake** next to Email/Password. Neighborly uses passwords, so I switched it off.
- **Email links need an allowed domain.** I added `akshitrohilla-prog.github.io` under Authentication → Settings → Authorized domains.
- **The orange ball in the hero looked odd.** I tried a leaf, a building, a heart and a grocery basket as pictures, then decided to keep the ball for now.
- **Bugs I found in my own testing of the demo version:** old sample food expired and the feed went empty (the demo now refreshes it), a second browser tab could overwrite saved data (tabs now stay in sync), and the "Claim more" stepper showed after someone had already claimed (removed).

### Deployment
- Live app: https://akshitrohilla-prog.github.io/neighborly/
- Repo: https://github.com/AkshitRohilla-prog/neighborly
- Files in the repo: `index.html`, `hero3d.js`, `anton.woff2`.
