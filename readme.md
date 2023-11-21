# Latest Commit

## ctx.tsx

- This commit is the 2nd step towards getting Hosted UI working. It implements proper sign-in _and_ sign-out (but this still only works on mobile... and it's probably gonna stay that way).

- In earlier iterations, I found that when you logged in w/ the Hosted UI, you could sign out from the mobile client, no problems. Only issue was that even after you logged out, the _mobile browser_ you used to log in w/ _would remember_ the username and password credentials you used. This effectively forces the user to login with whatever first account they signed up with: that's a BIG PROBLEM. This commit fixes that by making use of `expo-auth-session`'s `openAuthSessionAsync` function. You'll find me using this function in line 125-126 inside the `ctx.tsx` file where I call:

  ```typescript
  WebBrowser.openAuthSessionAsync(
    `${userPoolUrl}/logout?client_id=${clientId}&logout_uri=${redirectUri}`
  );
  ```

  That url above is Amazon Cognito's Hosted UI logout endpoint. I found out that Amazon Cognito has a logout url specifically for the Hosted UI that you can go to and just used that. It worked.

- Initially, the boilerplate code for logging out would call `AuthSession.revokyAsync` which I've commented out: this function would revoke your auth tokens with Amazon Cognito's `/oauth2/revoke` api endpoint and log you out, _but_ it never cleared the username and password credentials on the phone browser. Hence, you would log out on the app, but only pseudo logged out on the phone's browser, effectively soft locking you to the first account you used to sign in. No such problem anymore on this commit. Turns out, swtiching to using the Hosted UI's `/logout` endpoint both revoked user credentials on the app _and_ cleared the browser username and password fields. We are dolla, dolla bill now, boys.

### Todo's

- Even though I have sign in and sign out working, I still have to split up the `authTokens` field into separate pieces of data in expo's secure storage. `authTokens` is a giant JSON object that contains a bunch of separate tokens and right now, I store it as one giant value inside expo's secure storage, but expo keeps yelling at me that it exceeds expo's 2MB capacity per key/value pair which will lead to potential incompatibilites on older versions of expo and perhaps older devices too, idk.

- Another thing to note is that expo's secure storage only stores data as strings, so right now, I have to convert the authTokens data into a JSON string which means that anytime I want to access a token, I have to `JSON.parse` it which isn't really ergonomic. I'd like to try and figure out how I can store data internally as strings, but have some interface that lets me access the tokens in their Javascript Object form.

# Commit: Sat Nov 18, 2023

- ID: 77f912dd371bea5b60c3e534e1a5be839442539f
- Message: sign-in boilerplate working, not actual sign-in

## sign-in.tsx

- this commit doesn't actually implement sign-in with AWS Cognito. It just sets up boilerplate with a sign-in button that updates a session context from `null` to `xxx`, which is a placeholder value that will get replaced with auth tokens in the future.
- The sign-in page has some code commented out from the `onPress()`, namely, after you've logged in, we don't redirect to the home page within the `onePress()` method, we do it outside with a conditional render. After some testing I found out that with the original `signIn()` method inside of the `onPress()` function, you would press 'Sign In' and then it would actually route you again to the sign in page even though it should have taken us to the home page. The problem was that after you got redirected to the `(tabs)` main page, `index.tsx`, the `session` state still wasn't updated from `null` to `'xxx'`, which was supposed to be the default string to signify that you've signed in. The session state gets updated asynchronously (I think, it might actually have to with components needing to re-render for the state to updated) on mobile, which is what was causing us to get redirected back to the sign in page. When you go back to the sign in page for a 2nd time, the `session` state is properly updated to `'xxx'` at which point if you press 'Sign In' now, you properly get redirected to the home page with no problems. The fix is to just have a conditional render in the sign-in page that redirects to the home page if the `session` reads as `'xxx'`. This effectively leads to 3 redirects:

  - 1st Redirect: You initially land on the home page in `(tabs)`, but since you're not logged in, you get redirected to the sign-in page
  - 2nd Redirect: You hit 'Sign In' and it sends you the `(tabs)` home page, but the `session` hasn't updated yet, so, the home page redirects you back to the sign in page
  - 3rd Redirect: Once you've come back to the sign-in page, the `session` gets properly updated to `'xxx'`, so you get redirected to the home page

- I would have prefered only 2 redirects and believe the 3rd shouldn't need to happen, but idk how to get rid of right now. So I'm leaving this commit and hope future me finds a way to deal with this (or just live with it). Good Luck Me.
