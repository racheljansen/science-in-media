
import os
import pandas as pd

files = os.listdir('data')

df = []

for this_dir in files:
    
    try:        
        node = pd.read_csv('data/' + this_dir + '/node.csv')
        question = pd.read_csv('data/' + this_dir + '/question.csv')
        info = pd.read_csv('data/' + this_dir + '/info.csv')
        print('Loading',this_dir,'...')
    except:
        print('Skipping',this_dir,'...')


    for i in range(len(info)):

        if not info['time_of_death'].isnull().iloc[i]:
            continue

        node_id = info.iloc[i]['origin_id']
        this_node = node[node['id'] == node_id]

        if not this_node['time_of_death'].isnull().iloc[0]:
            continue
        
        if this_node['participant_id'].isnull().iloc[0]:
            continue

        this_participant = int(this_node['participant_id'])

        this_question = question[question['participant_id'] == this_participant]
        
        row = []
        row += [this_dir]
        row += [this_participant]
        row += [info.iloc[i]['contents']]
        row += [this_question['response'].iloc[0]]        

        df += [row]

df = pd.DataFrame(df)
df.columns = ['experiment','participant','response','survey']
df.to_csv('joined_data.csv')
