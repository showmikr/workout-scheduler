# Notes about this commit

## sign-in.tsx

- this commit doesn't actually implement sign-in with AWS Cognito. It just sets up boilerplate with a sign-in button that updates a session context from `null` to `xxx`, which is a placeholder value that will get replaced with auth tokens in the future.
- The sign-in page has some code commented out from the `onPress()`, namely, after you've logged in, we don't redirect to the home page within the `onePress()` method, we do it outside with a conditional render. After some testing I found out that with the original `signIn()` method inside of the `onPress()` function, you would press 'Sign In' and then it would actually route you again to the sign in page even though it should have taken us to the home page. The problem was that after you got redirected to the `(tabs)` main page, `index.tsx`, the `session` state still wasn't updated from `null` to `'xxx'`, which was supposed to be the default string to signify that you've signed in. The session state gets updated asynchronously (I think, it might actually have to with components needing to re-render for the state to updated) on mobile, which is what was causing us to get redirected back to the sign in page. When you go back to the sign in page for a 2nd time, the `session` state is properly updated to `'xxx'` at which point if you press 'Sign In' now, you properly get redirected to the home page with no problems. The fix is to just have a conditional render in the sign-in page that redirects to the home page if the `session` reads as `'xxx'`. This effectively leads to 3 redirects:

  - 1st Redirect: You initially land on the home page in `(tabs)`, but since you're not logged in, you get redirected to the sign-in page
  - 2nd Redirect: You hit 'Sign In' and it sends you the `(tabs)` home page, but the `session` hasn't updated yet, so, the home page redirects you back to the sign in page
  - 3rd Redirect: Once you've come back to the sign-in page, the `session` gets properly updated to `'xxx'`, so you get redirected to the home page

- I would have prefered only 2 redirects and believe the 3rd shouldn't need to happen, but idk how to get rid of right now. So I'm leaving this commit and hope future me finds a way to deal with this (or just live with it). Good Luck Me.
