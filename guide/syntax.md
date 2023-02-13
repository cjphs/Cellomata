
## 1. States
States are defined at the very beginning of a script. 

```
Void, Dead, Alive
```

Additionally, colours can be defined for each state as follows:
```
Water, Sand, Grass
@colors
blue, yellow, green
```

This means that in the simulator view, cells with the Water state will be blue, cells with the Sand state will be yellow, and cells with the grass state will be green.

## 2. Rules
Rules are defined per-state, meaning that the rules only apply to any cells of a given state. They all consist of a declaration, clauses, and a terminal clause. For example, if we return to the Game of Life:

```
Dead ->
Alive if 3*Alive nearby
Dead otherwise.

Alive ->
Alive if 2*Alive nearby
Alive if 3*Alive nearby
Dead otherwise.
```

These rules apply to cells of the Dead state and the Alive state respectively. 

### 2.1 Declarations
In the above example, `Dead ->` and `Alive ->` are the declarations of both rule sets, meaning that any clause after `Dead ->` only apply to cells with the Dead state, and any clause after `Alive ->` apply to cells with the Alive state.

### 2.2 Clauses

Clauses typically have the following structure:

```
<Goal State> if <amount>*<neighbor state> <neighbor location>
```

The Goal state is what the current cell should become when the following `if` statement is true. `amount` can be an integer, a range of integers, or a variable (more on variables later).

### 2.3 Clause location statement
`nearby` to check all neighboring cells of the current cell.

### 2.4 Chance clauses
`with <chance/probability/prob/%> <value between 0 and 1>`

## 3. Variables

## 4. Simulator arguments
### 4.1 Width & height

### 4.2 Wrap