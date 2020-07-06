import csv
import json
import glob

def convert_to_json(csv_filename):
    with open(csv_filename, 'r') as csvfile:
        r = csv.reader(csvfile)
        dat = []
        for i, row in enumerate(r):
            if i == 0:
                pass
            else:
                trial = {}
                trial['taskNum'] = row[0]
                trial['stimuli'] = [i for i in row[1:7] if i != '']
                trial['trials'] = [[j for j in i.split(' ') if j != ''] for i in row[7:10]]
                trial['stimsType'] = row[11]
                try:
                    trial['difficulty'] = row[12]
                except IndexError:
                    trial['difficulty'] = None
                dat.append(trial)
    json_filename = f'./json/{csv_filename.split("/")[-1].split(".")[-2]}.json'
    with open(json_filename, 'w') as jsonfile:
        json.dump(dat, jsonfile, indent=4)

if __name__ == "__main__":
    for f in glob.glob('./csv/*'):
        convert_to_json(f)