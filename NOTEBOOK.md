# Class Notebook: Neighborly

## Entry: Neighbor food sharing (version 1)

**Date:** [11/10/2026]
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

### Roadmap
- **Version 2:** connect a shared database (e.g., Firebase) so every neighbor sees the same live feed.
- **Version 3:** notifications when new food is posted nearby (e.g., the ntfy app or web push).
- **Later:** accounts, ratings, chat with the giver, and groups per building.

### Problems & how I solved them
- [Add anything that went wrong while deploying, and how you fixed it]

### Deployment
- Live app:(https://akshitrohilla-prog.github.io/neighborly/)
- Repo:(https://github.com/AkshitRohilla-prog/neighborly)
