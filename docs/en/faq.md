---
order: 14
authors:
  - JorelAli
---

# FAQ

Here's a list of questions that have come up time and time again which all have the same answer.

## How do I use (insert feature here) in the CommandAPI?

The CommandAPI's documentation is the place to search for anything! In the top left corner of this documentation, you can find this <i class="fas fa-search"></i> icon. You can pretty much search for anything - it'll find it!

## Does the CommandAPI support reloading via `/reload`?

Formally, no. If you are encountering issues with `/reload`, consider not using `/reload`. More information about reloading can be found in [Plugin reloading](./utils/reload).

## Does the CommandAPI support optional arguments?

As of 9.0.0, yes! Please view information on optional arguments in [Optional arguments](./create-commands/arguments/optional-arguments).

## Does the CommandAPI support suggestions in the annotation system?

Not yet. The CommandAPI's annotation system was actually originally a little test on writing a compile-time annotation system which actually worked out much better than I had intended. I plan to rewrite the CommandAPI's annotation system to make it much more powerful (and support suggestions!). This is stated in the [project roadmap](https://github.com/CommandAPI/CommandAPI#future-project-plans--timeline)

## Can you add tooltips to literal/multiliteral arguments?

No. This is a Brigadier limitation.

:::info Technical reason that this is a limitation of Brigadier

Brigadier's code has two classes for arguments, [`LiteralCommandNode`](https://github.com/Mojang/brigadier/blob/master/src/main/java/com/mojang/brigadier/tree/LiteralCommandNode.java) and [`ArgumentCommandNode`](https://github.com/Mojang/brigadier/blob/master/src/main/java/com/mojang/brigadier/tree/ArgumentCommandNode.java). The `ArgumentCommandNode` class contains a field `customSuggestions` of type `SuggestionProvider<S>` which is used to handle suggestions - this field is not present inside `LiteralCommandNode`, meaning that LiteralArguments cannot provide suggestions to users.

We need suggestions to provide tooltips. This is because [`SuggestionProvider` provides us with an instance of `SuggestionsBuilder`](https://github.com/Mojang/brigadier/blob/master/src/main/java/com/mojang/brigadier/suggestion/SuggestionProvider.java#L13), [`SuggestionsBuilder` contains a `List<Suggestion>`](https://github.com/Mojang/brigadier/blob/cf754c4ef654160dca946889c11941634c5db3d5/src/main/java/com/mojang/brigadier/suggestion/SuggestionsBuilder.java#L20) and the [`Suggestion` class contains `Message`](https://github.com/Mojang/brigadier/blob/cf754c4ef654160dca946889c11941634c5db3d5/src/main/java/com/mojang/brigadier/suggestion/Suggestion.java#L14). This `Message` class is what is needed to display a tooltip to users.

:::

## Can I change the message that is sent to the user when they don't have permission to run a command?

No. That message is handled client-side and isn't controlled by the CommandAPI. An alternative solution is to perform permission checking _inside_ the command and return a custom message if it's not satisfied:

```java
new CommandAPICommand("mycommand")
    .withPermission("some.permission") // [!code --]
    .executes((sender, args) -> {
        if(!sender.hasPermission("some.permission")) { // [!code ++]
            throw CommandAPI.failWithString("You don't have permission to run /mycommand!"); // [!code ++]
        } // [!code ++]
        sender.sendMessage("Hello!");
    })
    .register();
```

## Can I change the message that is sent to the user when an argument isn't valid?

No. That message is handled client-side and isn't controlled by the CommandAPI.

## My suggestions on my arguments are empty or don't update. How do I make dynamic suggestions?

Arguments with suggestions provided using `ArgumentSuggestions.strings(String...)` are calculated _when the command is registered_. In order to have argument suggestions calculated _when the command is being typed_, you need to use the lambda-variant of the `ArgumentSuggestions.strings(Function<SuggestionInfo, String[]> suggestions)` method instead. More information about the different methods can be found [here](./create-commands/arguments/suggestions/suggestions#the-argumentsuggestions-interface).

The easiest way to do this is to add `info ->` at the start of your array:

```java
ArgumentSuggestions.strings(SomeClass.someArray); // [!code --]

ArgumentSuggestions.strings(info -> SomeClass.someArray); // [!code ++]
```