from enum import Enum
from cascript import *

class MODE(Enum):
    READ_STATES = 1
    DEFINE_CONDITIONS = 2
    SKIP = 3
    

interpreter_mode = MODE.READ_STATES

state_being_defined = ""

rules = None

f = open("python/rules.txt")

l = True
while(l):
    l = f.readline()\
    
    if l == "\n" or l == "":
        print("@@ Line skipped")
        continue
    else:
        l = l.strip()
        print(l)

        if interpreter_mode == MODE.READ_STATES:
            states = l.split(", ")
            print(states)

            rules = ruleset(states)
            print(rules)

            interpreter_mode = MODE.SKIP

        elif interpreter_mode == MODE.SKIP:
            l = l.split(" ")

            if l[1] == "becomes":
                interpreter_mode = MODE.DEFINE_CONDITIONS
                print(l[0])
                state_being_defined = l[0]

                print("@@ Entering condition definitions for state", l[0])

        elif interpreter_mode == MODE.DEFINE_CONDITIONS:
            l = l.split(" ")
            print(l)

            chance = 1

            # chance
            if len(l) > 1 and l[1] == "with":
                if l[2] == "chance":
                    chance = float(l[3])
                    del l[1:3]

            if len(l) > 1 and l[1] == "if":
                locality = l[2].split("*")
                locality_check_type = ""
                
                print(locality)

                if len(locality) == 1:
                    count = -1
                    locality_check_type = locality[0]
                else:
                    count = locality[0]
                    locality_check_type = locality[1]

                rules.add_rule(state_being_defined, transformation(l[0], locality_check_type, l[3], int(count), chance))
            else:
                end_conditions = False
                if l[len(l)-1][-1] == ".":
                    end_conditions = True
                    l[len(l)-1] = l[len(l)-1][0:(len(l)-2)]

                rules.add_rule(state_being_defined, transformation(l[0], "", "always", -1, chance))

                if end_conditions:
                    interpreter_mode = MODE.SKIP


# d = "dead"
# a = "alive"

current_grid = grid(6,6,rules)
# current_grid.set_cell_state(3,3,a)
# current_grid.set_cell_state(4,3,a)
# current_grid.set_cell_state(2,3,a)
# current_grid.set_cell_state(2,2,a)
# current_grid.set_cell_state(3,1,a)

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
