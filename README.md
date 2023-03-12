# TOKEN TAKEOVER by [Nuke Town](https://t.me/nukingyou)

## How to Setup

1. Install node and NPM
2. Run setup.bat
3. Change the config.json to your liking, however the package works without changing it. There is an input for your token when you open the app, but the config token will allow you to automatically login. For more info, go to CONFIG.md.
4. Run start.bat


## What do all the files do?

bigtokens.json saves all tokens that are bigger than the member count for big tokens stated in config.json
`"member_count_to_save_to_big_tokens": 1000,`
By default, it is set to 1000 members.

tokens.json saves all tokens that are bigger than the member count for normal tokens stated in config.json
`"member_count_to_save": 50,`
By default, it is set to 50 members.

proxies.txt is used for the spammer, but isn't required. You can enable the proxy spammer mode in config.json, but make sure to have <bold>quality</bold> proxies, because it is a quick spammer. (PROXY SPAMMER IN BETA)

## Notes:

Restarting closes the console instance, meaning there is no logging. To report an issue, if there are any, please add the error logs in with the issue report on the GitHub or Discord.