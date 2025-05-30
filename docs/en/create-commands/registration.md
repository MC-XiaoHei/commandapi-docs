---
order: 1
authors:
  - DerEchtePilz
  - willkroboth
  - JorelAli
  - Abelkrijgtalles
---

# Command registration

To register commands with the CommandAPI, we use the `CommandAPICommand` class. It follows a simple builder pattern to improve readability.

I think the easiest way to explain it is with an example:

:::tabs
===Java
<<< @/../reference-code/src/main/java/createcommands/Registration.java#registrationExample
===Kotlin
<<< @/../reference-code/src/main/kotlin/createcommands/Registration.kt#registrationExample
:::

- First, we create a new `CommandAPICommand`, with the name of the command that the sender must enter to run it.

- Then, we create an argument to add to the command using `withArguments`. This is described in more detail in [the section on arguments](./arguments/arguments).

- In this example, we add an alias, "broadcast", to the command. This allows the sender to use either `/broadcastmsg <message>` or `/broadcast <message>`.

- By using `withPermission`, we require the sender to be an OP in order to run the command.

- We control what the command does using `executes` (this is described in more detail in [the section on command executors](./executors/command-executors)).

- Finally, we register the command to the CommandAPI using `register`.

That's it! This simple snippet of code fully registers the command to the server. You don't need to supply a plugin instance, you don't have to create a custom class and you don't have to mess with the `plugin.yml` file.

Throughout this documentation, we will use the various different methods for command registration to give you an idea of when and where certain methods are more suitable than others.

## `CommandAPICommand` methods

The `CommandAPICommand` has various methods, which are outlined below:

#### Setting the command name

```java
new CommandAPICommand(String commandName)
```

This constructor creates a new instance of the `CommandAPICommand` object. This constructor requires the _name_ of the command.

#### Setting command properties

```java
CommandAPICommand withArguments(List<Argument> arguments)
CommandAPICommand withArguments(Argument... arguments)
```

The `withArguments` method is used to add arguments to your command. The `arguments` parameter is appended to the list of arguments for the command.

```java
CommandAPICommand withPermission(CommandPermission)
CommandAPICommand withPermission(String)
```

The `withPermission` method is used to assign a permission that is required to execute the command. (See [the section on permissions](./permissions) for more info).

```java
CommandAPICommand withRequirements(sender -> {})
```

The `withRequirements` method is used to assign additional constraints required to execute the command, similar to permissions. (See [the section on requirements](./requirements) for more info).

```java
CommandAPICommand withAliases(String... args)
```

The `withAliases` method is used to declare a list of aliases that can be used to run this command via. (See [the section on aliases](./aliases) for more info).

```java
CommandAPICommand withHelp(String shortDescription, fullDescription)
CommandAPICommand withHelp(HelpTopic helpTopic)
CommandAPICommand withShortDescription(String shortDescription)
CommandAPICommand withFullDescription(String fullDescription)
```

The `withHelp` method, along with its specific `withShortDescription` and `withFullDescription` methods are used to declare the help topic for this command which is displayed in the `/help` command. (See [the section on help](./help) for more info).

```java
CommandAPICommand withSubcommand(CommandAPICommand subcommand)
```

The `withSubcommand` method is used to declare a subcommand that leads on from the current command. (See [the section on subcommands](./subcommands) for more info).

#### Setting the command's executor

```java
CommandAPICommand executes((sender, args) -> {})
CommandAPICommand executes(info -> {})
```

Executes a command using the `CommandSender` object.

```java
CommandAPICommand executesPlayer((player, args) -> {})
CommandAPICommand executesPlayer(info -> {})
```

Executes a command only if the command sender is a `Player`.

```java
CommandAPICommand executesEntity((entity, args) -> {})
CommandAPICommand executesEntity(info -> {})
```

Executes a command only if the command sender is an `Entity`.

```java
CommandAPICommand executesCommandBlock((cmdblock, args) -> {})
CommandAPICommand executesCommandBlock(info -> {})
```

Executes a command only if the command sender is a `BlockCommandSender`.

```java
CommandAPICommand executesConsole((console, args) -> {})
CommandAPICommand executesConsole(info -> {})
```

Executes a command only if the command sender is a `ConsoleCommandSender`.

```java
CommandAPICommand executesProxy((proxy, args) -> {})
CommandAPICommand executesProxy(info -> {})
```

Executes a command only if the command sender is a `ProxiedCommandSender`.

```java
CommandAPICommand executesNative((proxy, args) -> {})
CommandAPICommand executesNative(info -> {})
```

Executes a command regardless of what the command sender is, using the `NativeProxyCommandSender`.  Read more about native proxied command senders [here](./executors/native-sender).

:::info

Sometimes, the Java compiler throws an error saying that a method is ambiguous for the type CommandAPICommand. This is due to a limitation in Java's type inference system and is not a fault of the CommandAPI. If we take the following code, used to spawn a pig:

```java
new CommandAPICommand("spawnpigs")
     .executesPlayer((player, args) -> {
           for(int i = 0; i < 10; i++) {
               player.getWorld().spawnEntity(player.getLocation(), (EntityType) args.get(0));
           }
     })
     .register();
```

The Java type inference system can’t determine what the type of the lambda `(player, args) -> ()` is, therefore, it produces the following compilation error:

```log
The method executesPlayer(PlayerCommandExecutor) is ambiguous for the type CommandAPICommand
```

This can easily be resolved by declaring the specific type of the command sender and the arguments. For example:

```java
new CommandAPICommand("spawnpigs")
     .executesPlayer((Player player, CommandArguments args) -> {
           for(int i = 0; i < 10; i++) {
               player.getWorld().spawnEntity(player.getLocation(), (EntityType) args.get(0));
           }
     })
     .register();
```
:::

#### Registering the command

```java
void register()
```

Registers the command with the default namespace.

If you are not shading, the default namespace is going to be `commandapi`. Hence it is recommended that you use one of the two methods below to register your commands.

If you are [shading](../dev-setup/shading), the default namespace is going to be the name of your plugin. You can also change the default namespace using `CommandAPIConfig#setNamespace(String)`.
Hence you can safely use this method to register your commands without the namespace being `commandapi`, while you're also able to change individual namespaces for commands using the methods below.

```java
void register(String namespace)
```

Register the command with a custom-provided namespace.

```java
void register(JavaPlugin plugin)
```

Register the command with the provided plugin's name.

## Command loading order

It is recommended to register commands in either the `onLoad()` or `onEnable()` method. With the CommandAPI, depending on whether you use `onLoad()` or `onEnable()` to load your commands depends on whether your plugin is used with Minecraft's functions:

| When to load        | What to do                                                                                                                     |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| `onLoad()` method   | Register commands to be used in Minecraft functions ([see the Function section for more info](./functions-and-tags/functions)) |
| `onEnable()` method | Register regular commands                                                                                                      |

The CommandAPI does support registering commands outside of these methods while the server is running. Commands registered after the server is done loading _should_ work the same as commands registered in `onEnable`.
