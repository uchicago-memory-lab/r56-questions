import random
import argparse
import json

parser = argparse.ArgumentParser(description='Generate some random double digit addition problems.')
parser.add_argument('--N', default=200, type=int)
args = parser.parse_args()

problems = []
for i in range(args.N):
    parity = random.choice((True, False))
    a1 = random.randint(1, 9)
    a2 = random.randint(0, 9)
    b1 = random.randint(1, 9)
    b2 = random.randint(0, 9)
    b = f'{b1}{b2}'
    a = f'{a1}{a2}'
    if parity:
        c = int(a) + int(b)
    else:
        c = int(a) + int(b) + random.choice((-1, 1)) * random.randint(1, 9)
    
    question = f'{a} + {b} = {c}'
    answer = str(parity)

    problems.append([question, answer])

with open('questions/json/distractors.json', 'w+') as f:
    json.dump(problems, f)