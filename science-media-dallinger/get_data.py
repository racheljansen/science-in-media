
import pandas as pd
import os, sys

exp_file = sys.argv[1]

df = pd.read_csv(exp_file, header = None)
df.columns = ['exp_id','dlgr_id','code_version','story_num','rep']

for i in range(len(df)):
    
    row = df.iloc[i]

    dlgr_id = row['dlgr_id']
    
    exp_name = '--'.join([row['exp_id'],
                          dlgr_id,
                          'code_version',str(row['code_version']),
                          'story_num',str(row['story_num']),
                          'rep',str(row['rep'])])

    os.system('dallinger export --app ' + dlgr_id)
    
    os.system('unzip data/' + dlgr_id + '-data.zip -d data/' + exp_name)
    os.system('mv data/' + exp_name + '/data/* data/' + exp_name + '/')
    os.system('rm data/' + dlgr_id + '-data.zip')
