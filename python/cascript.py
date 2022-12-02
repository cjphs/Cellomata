from random import random

class transformation:
    # count = -1 -> true for any count
    def __init__(self, goal_state, locality_cell_type="", locality_type="always", count=-1, chance=1):
        self.chance=chance
        self.goal_state = goal_state
        self.locality_type = locality_type
        self.locality_cell_type = locality_cell_type
        self.count = count

    def evaluate(self, neighborhood):

        if self.chance != 1:
            if random() >= self.chance:
                return False

        match self.locality_type:
            case "always":
                return True

            case "nearby":
                if self.count == -1:
                    return neighborhood[self.locality_cell_type] > 0
                else:
                    return (neighborhood[self.locality_cell_type] == self.count)

        return False

    def __str__(self):
        return f"transformation: (goal={self.goal_state}, locality_type={self.locality_type}, locality_cell_check={self.locality_cell_type}, count={self.count})"


class ruleset:
    def __init__(self, states):

        self.transformations = {}
        self.states = states

        for s in self.states:
            self.transformations.update({s: []})

    def add_rule(self, from_state, transformation):
        self.transformations[from_state].append(transformation)

    def get_default_state(self):
        return self.states[0]

    def get_states_dictionary(self, default_value=0):
        d = {}
        for s in self.states:
            d.update({s: default_value})
        return d


class grid:
    def __init__(self, width, height, rules):
        self.width = width
        self.height = height
        
        self.rules = rules

        self.grid = self.get_empty_grid(self.width, self.height)

    def get_empty_grid(self, width, height):
        return [[self.rules.get_default_state() for y in range(width)] for x in range(height)]

    def coordinates_in_bounds(self, x, y):
        return not (x < 0 or x > self.width-1 or y < 0 or y > self.height-1)

    def get_cell_state(self, x, y):
        if not self.coordinates_in_bounds(x,y):
            return ""
        else:
            return self.grid[y][x]

    def set_cell_state(self, x, y, state):
        if self.coordinates_in_bounds(x,y):
            self.grid[y][x] = state

    def evolve(self):

        next_grid = self.get_empty_grid(self.width, self.height)
        x,y = 0,0

        for row in self.grid:
            for cell in row:
                neighborhood_dict = self.rules.get_states_dictionary()

                next_grid[y][x] = self.get_cell_state(x,y)

                state = self.get_cell_state(x,y)

                for i in range(y-1,y+2):
                    for j in range(x-1,x+2):
                        if i == y and j == x:
                            continue
                        else:
                            cell = self.get_cell_state(j,i)

                            if cell != "":
                                neighborhood_dict[cell] += 1

                for rule in self.rules.transformations[state]:
                    if rule.evaluate(neighborhood_dict):
                        next_grid[y][x] = rule.goal_state
                        break

                x += 1
            x = 0
            y += 1

        self.grid = next_grid


    def __str__(self):
        s = ""
        for row in self.grid:
            s += str(row) + "\n"

        return s


if __name__ == "main":
    d = "."
    a = "O"

    rules = ruleset([d, a])
    rules.add_rule(d, transformation(a, a, "nearby", 3))
    rules.add_rule(d, transformation(d))

    rules.add_rule(a, transformation(a, a, "nearby", 2))
    rules.add_rule(a, transformation(a, a, "nearby", 3))
    rules.add_rule(a, transformation(d))

    current_grid = grid(6,6,rules)
    current_grid.set_cell_state(3,3,a)
    current_grid.set_cell_state(4,3,a)
    current_grid.set_cell_state(2,3,a)
    current_grid.set_cell_state(2,2,a)
    current_grid.set_cell_state(3,1,a)

    print("before")
    print(current_grid)
    current_grid.evolve()
    print("after")
    print(current_grid)
    current_grid.evolve()
    print("after")
    print(current_grid)
    current_grid.evolve()
    print("after")
    print(current_grid)
    current_grid.evolve()
    print("after")
    print(current_grid)

    current_grid.evolve()
    print("after")
    print(current_grid)

