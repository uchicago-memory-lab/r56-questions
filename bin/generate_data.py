#!/usr/bin/env python
import pandas as pd
import dataset
from time import time
import zipfile
import os
import glob
import json
from pandas.api.types import CategoricalDtype
from pandas.core.frame import DataFrame

db = dataset.connect(
    'postgresql://oclegmcmrdjbci:39bfe507ff827cbf256b41e2705f85c4c4951fb45e586e9b0301388ec10ba52d@ec2-54-204-26-236.compute-1.amazonaws.com:5432/d9gtgqbcv3aqam'
)

def zipdir(path, ziph):
    for dirname, subdirs, files in os.walk(path):
        for filename in files:
            ziph.write(os.path.join(dirname, filename), arcname=filename)

qkindtype = CategoricalDtype(['EMObjectPicture', 'EMWordStim', 'SMObjectNaming', 
                'WMForwardDigitSpan', 'WMBackwardDigitSpan', 'EFStroop', 
                'EFRuleID', 'PSStringComparison', 'LongTerm', 'endSurvey'], ordered=True)

qblocktype = CategoricalDtype(['practice', 'easy', 'medium', 'hard', 'longterm', 'survey'], ordered=True)


def by_subject():
    with open('./questions/json/qblock.json', 'r') as f:
        qblock = json.load(f)
    
    answers = db['answers']
    rt = db['reaction_time']
    ordering = db['ordering']
    if not os.path.exists('files/by_subject'):
        os.mkdir('files')
        os.mkdir('files/by_subject')
    for i in db['response']:
        pid = i['pid']
        data = {'ordering': [], 'item': [], 'trial': [], 'reaction_time': [],
        'response': [], 'answer': [], 'score': [], 'type': [], 'block': []}
        tic = time()
        r = rt.find_one(pid=pid)
        o = ordering.find_one(pid=pid)
        for j in answers:
            data['item'].append(j['task'].upper()[1:-2])
            data['trial'].append(j['task'][-1])
            data['reaction_time'].append(r[j['task'].lower()])
            if data['item'][-1][0:2] == 'ES':
                data['answer'].append('')
            else:
                data['answer'].append(j['answer'])
            if j['task'].lower() in i:
                data['response'].append(i[j['task'].lower()])
            else:
                data['response'].append(None)
            if data['item'][-1][0:2] == 'ES':
                data['score'].append('')
            else:
                data['score'].append(data['answer'][-1] == data['response'][-1])
            data['ordering'].append(o[j['task'].lower()])
            if data['item'][-1][0:2] == 'LT':
                data['type'].append('LongTerm')
                data['block'].append('longterm')
            else:
                data['type'].append(qblock[data['item'][-1]]['kind'])
                data['block'].append(qblock[data['item'][-1]]['difficulty'])

        print(f'Fetching data for {pid} took {time() - tic} seconds.')
        data = pd.DataFrame(data)
        data['type'] = data['type'].astype(qkindtype)
        data['block'] = data['block'].astype(qblocktype)
        data = data.sort_values(['type', 'block', 'item', 'trial'])
        data.to_csv(f'files/by_subject/{pid}.csv', index=False)
    zipf = zipfile.ZipFile('files/by_subject.zip', 'w', zipfile.ZIP_DEFLATED)
    zipdir('files/by_subject', zipf)
    zipf.close()

def main():
    by_subject()



if __name__ == "__main__":
    st = time()
    main()
    print(time() - st)