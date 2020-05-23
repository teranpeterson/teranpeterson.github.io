colors = set()

with open("dark_defaults.json", "r") as file:
    lines = file.readlines()
    for line in lines:
        print(line)
        if "#" in line:
            i = line.index("#")
            code = line[i:i+6]
            print(code)
            colors.add(code)
print(colors)