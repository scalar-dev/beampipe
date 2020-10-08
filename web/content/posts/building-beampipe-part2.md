---
title: "Building beampipe part II: frontend"
description: Hello again 👋 and welcome to part two of this series talking about how we build beampipe.io, a privacy-conscious and fun alternative to Google Analytics. In part one we talked about backend so…
author: Alex
date: 2020-08-21
---

Hello again 👋👋👋 and welcome to part two of this series talking about how we build beampipe.io, a privacy-conscious and fun alternative to Google Analytics.

---

In part one we talked about backend so naturally it's now time for us to turn to frontend. I'll start with a confession - I am not by skill or by inclination a frontend developer. Don't get me wrong, I've written a lot of frontend code over the years (perhaps I'm just in denial) but it's normally been about getting something built rather than more careful crafting. I'd say that's changed a little in the last few years as frontend tooling has improved drastically. Seriously, if you are a backend engineer looking to get your feet wet, no time like the present.

## Typescript + React
Anyway back to the subject, what tools are we using and why. Let's start with some easy decisions. It's probably not an understatement to say that I like static types. The stronger the type system the better. Particularly with web development, I find this drastically reduces the number of mistakes I make (typos in variable names or wrong usage of APIs being particularly common problems). So without a very compelling reason not to, I start every project with Typescript.

The other easy pick for me is React. This is pragmatic more than principled. I'm sure Vue and Angular and Alpine.js are all great in their own ways but as a lone developer I've got enough plates spinning already so I pick something simple which I now know relatively well.

![The Lambda cube. About the prettiest thing I could find related to static-types. Head on down the wiki rabbithole: https://en.wikipedia.org/wiki/Lambda_cube](/images/blog/lambdacube.png)

## NextJS
Like a lot of modern applications, Beampipe's UI is mostly a single page application (SPA). This means that your browser typically downloads a blob of javascript which dynamically manipulates the content of the webpage to show the UI and effect transitions between pages. This is a particularly good fit for Beampipe, which is interactive and data-heavy.

create-react-app is a fantastically easy way to get started with React. However, for beampipe I opted to use NextJS instead.

NextJS's main claim to fame is that it shakes up the SPA model a little by enabling server side rendering (SSR). This means NextJS can execute your React code server side, render the UI of your application and send this down to your browser as fully-formed HTML. This reduces the delay before your application is rendered on the client and also helps search engines index your content.

**But actually neither of these are very compelling things for Beampipe**. We generally don't need Google to index an analytics dashboard and the rendering latency is also not a huge concern (particularly as the client will often request new data as the user interacts with the page). On the other hand, I've found NextJS really easy to write code in and the SSR capabilities are handy for some of the public pages. For instance NextJS is able to statically render the landing and authentication pages which is quite nice when I get the odd spike of traffic.

Using NextJS means I do have to run another container, but since I'm already using Kubernetes, this isn't a big problem. That said, for someone who hasn't used NextJS before, I'd probably default to create-react-app and save some of the headache.

## APIs
Back in part one, I mentioned that we're using GraphQL for the API along with urql on the client. urql is great. Whenever I need a more advanced feature, I reach for it and it's there without having to dig deep into the internals (as I sometimes found I had to with apollo-client). React hooks make it a joy to use. It's also well supported in NextJS via next-urql. This will talk to your API server side and thus pass the page to the client fully formed and ready to go.
Beampipe's primary dashboard view. Also check out the previous article to see the difference a week's work has made! 

## 😆CSS / Design
As I said, frontend development generally hasn't been a strong point for me. However, the analytics space is filled with some very beautiful UIs (plausible, fathom among others). To compete at all with them, I'd need to make beampipe at least passable from a design perspective. In practice, this means having fairly tight control over the design and not (as I have done previously) just shoving in a framework.

For this reason, I picked TailwindCSS. Tailwind is a fairly new, low-level CSS framework which basically just gives you some utility classes for doing things like adding padding or setting fixed sizes or working with flexbox. This looks and sounds horrifying at first but it actually seems to produce pretty good results. You can use React to abstract components with standardised (but very customised) look and feel. It's also quite handy when you want to take inspiration from other sites (a growing number are using tailwind) 😃.

A fringe benefit of choosing such a low level CSS framework is that it's really forced me to try to get my head around things like Flexbox and the various quirks of how browsers render and size elements on the page. I won't pretend to enjoy this but it has been worthwhile and I'd recommend any frontend-curious backend engineer give it a spin.

![Real life Tailwind code from Beampipe's landing page. Looks gross. Actually not half bad.](/images/blog/css.png)

Programmers often fear things that we do not understand or which appear to behave unpredictably. I'm sure many of us nightmares (or even current experiences) of impossible to track down bugs or things that seemed to just make no sense. I certainly experience this occasionally but it's something that has become joyfully less frequent as I've gained experience. It's now quite rare for me to feel stressed or intimidated by a bug.

**Not so with CSS**. Magic incantations that I don't understand copied and pasted from StackOverflow. It scares me. The solution to this, quite naturally, is to knuckle down and learn it properly (kind of). I now find the fear and self-doubt is starting to recede and UI work, whilst still frustrating, has become more fun. It's also really liberating to see something you don't like in the UI and generally just be able to go in and fix it up right away.


---

That's all for now. In the meantime do come have click around at beampipe.io or write to us [hello@beampipe.io](mailto:hello@beampipe.io) Cheers!