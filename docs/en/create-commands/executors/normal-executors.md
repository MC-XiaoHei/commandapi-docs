---
order: 2
authors:
  - DerEchtePilz
  - willkroboth
  - JorelAli
---

# Normal command executors

Command executors are of the following format, where `sender` is a [`CommandSender`](https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/command/CommandSender.html), and `args` is a [`CommandArguments`](../arguments/command-arguments) object, which represents arguments which are parsed by the CommandAPI.

```java
new CommandAPICommand("...")
    .executes((sender, args) -> {
        // Your code here  
    })
    .register();
```

With normal command executors, these don’t need to return anything. By default, this will return a _success value_ of 1 if it runs successfully, and a _success value_ of 0 if it runs unsuccessfully, either by throwing an exception _(RuntimeException)_ or by forcing the command to fail (See the section on [handling command failures](./handle-failures)).

In short, this is what values are returned when a command is executed from a normal command executor:

|                   | Command Works | Command Doesn't Work |
|:-----------------:|:-------------:|:--------------------:|
| **Success Value** |       1       |          0           |
| **Result Value**  |       1       |          0           |

::::tip Example – Creating a message broadcasting system

To illustrate this, let's take a look at a simple message broadcasting command. We'll make a command which sends a message to everyone on the server, using the following syntax:

```mccmd
/broadcastmsg <message>
/broadcastmessage <message>
/broadcast <message>
```

We use an argument "message" to hold the message to broadcast, we provide some aliases and set a permission required to run the command. Then we declare our main command body by using the `.executes()` method, before finally registering the command:

:::tabs
===Java
<<< @/../reference-code/src/main/java/createcommands/executors/NormalExecutors.java#broadcastExample
===Kotlin
<<< @/../reference-code/src/main/kotlin/createcommands/executors/NormalExecutors.kt#broadcastExample
:::

Note how when we finish up our implementation of `.executes()`, we don't return anything. This is unlike commands in the standard Bukkit API where the `onCommand` method returns a Boolean value:

```java
boolean onCommand(CommandSender, Command, String, String[])
```

The returning of this Boolean value is handled automatically by the CommandAPI at a much lower level.

::::

## Restricting who can run your command

The `CommandAPICommand` class has multiple different `executes...()` methods that can restrict the command sender to any of the following objects:

| CommandSender Object       | Method to use             | Who can run this?                                 |
|----------------------------|---------------------------|---------------------------------------------------|
| `CommandSender`            | `.executes()`             | Any CommandSender                                 |
| `Player`                   | `.executesPlayer()`       | In-game players only                              |
| `Entity`                   | `.executesEntity()`       | Entities only                                     |
| `BlockCommandSender`       | `.executesCommandBlock()` | Command blocks only                               |
| `ConsoleCommandSender`     | `.executesConsole()`      | The console only                                  |
| `ProxiedCommandSender`     | `.executesProxy()`        | Proxied senders only<br />(via `/execute as ...`) |
| `NativeProxyCommandSender` | `.executesNative()`       | See [Native CommandSenders](./native-sender)      |

::::tip Example - A `/suicide` command

Say we wanted to create a command `/suicide`, which kills the player that executes it. Since this command can't be used by non-players (you can't kill a command block!), we can restrict it so only players can execute this command. Since it's a player, we can use the `.executesPlayer()` method:

:::tabs
===Java
<<< @/../reference-code/src/main/java/createcommands/executors/NormalExecutors.java#suicideExample
===Kotlin
<<< @/../reference-code/src/main/kotlin/createcommands/executors/NormalExecutors.kt#suicideExample
:::

::::

## Multiple command executor implementations

The CommandAPI allows you to chain different implementations of the command depending on the type of `CommandSender`. This allows you to easily specify what types of `CommandSender`s are required to run a command.

Extending on the suicide example above, we could write another implementation for a different `CommandSender`. Here, we write an implementation to make entities (non-player) go out with a bang when they run the command (using `/execute as <entity> run suicide` command).

::::tip Example - A `/suicide` command with different implementations

:::tabs
===Java
<<< @/../reference-code/src/main/java/createcommands/executors/NormalExecutors.java#differentImplExample
===Kotlin
<<< @/../reference-code/src/main/kotlin/createcommands/executors/NormalExecutors.kt#differentImplExample
:::

This saves having to use `instanceof` multiple times to check the type of the `CommandSender`.

::::

The different command sender priority is the following (from highest priority to lowest priority):

```mermaid
graph TD
    A(".executesNative() (Always chosen if used)") --> B(".executesPlayer()")
    B --> C(".executesEntity()")
    C --> D(".executesConsole()")
    D --> E(".executesCommandBlock()")
    E --> F(".executesProxy()")
    F --> G(".executes()")
```

## Multiple command executors with the same implementation

The CommandAPI also allows you to have multiple command executors with the same command implementation. This is useful for when you want to restrict the command sender required to run a command, but want to run the same code for each different command sender type.

This is achieved using the `.executes(executor, ...)` method, which accepts a variadic array of `ExecutorType` objects. `ExecutorType` has the following values:

| ExecutorType Object | Who can run this?                                 |
|---------------------|---------------------------------------------------|
| `ALL`               | Any CommandSender                                 |
| `PLAYER`            | In-game players only                              |
| `ENTITY`            | Entities only                                     |
| `BLOCK`             | Command blocks only                               |
| `CONSOLE`           | The console only                                  |
| `PROXY`             | Proxied senders only<br />(via `/execute as ...`) |
| `NATIVE`            | See [Native CommandSenders](./native-sender)      |

::::tip Example - A `/suicide` command with the same implementation

Expanding on the suicide example above, we can restrict the command to only players and entities. We know that the command sender is a `LivingEntity`, so we can cast to it safely.

:::tabs
===Java
<<< @/../reference-code/src/main/java/createcommands/executors/NormalExecutors.java#sameImplExample
===Kotlin
<<< @/../reference-code/src/main/kotlin/createcommands/executors/NormalExecutors.kt#sameImplExample
:::

::::

## Using the ExecutionInfo

You can also implement a command executor which uses an `ExecutionInfo` object:

```java
new CommandAPICommand("...")
    .executes(info -> {
        // Use info here
    })
    .register();
```

The `ExecutionInfo` provides two user-facing methods which both let you access the [`CommandSender`](https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/command/CommandSender.html) and the arguments:

```java
CommandSender sender();
```

This method automatically detects which CommandSender type has been used, similar to the `.executesXXX()` method (see [here](./normal-executors#restricting-who-can-run-your-command))! Therefore, casting is not necessary!

The second method lets you access the command's arguments:

```java
CommandArguments args();
```