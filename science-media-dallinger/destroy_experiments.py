
import pandas as pd

import os,sys

exp_file = sys.argv[1]

df = pd.read_csv(exp_file, header = None)
df.columns = ['exp_id','dlgr_id','code_version','story_num','rep']

for i in range(len(df)):
    
    row = df.iloc[i]
    dlgr_id = row['dlgr_id']
    
    os.system('dallinger destroy --app ' + dlgr_id + ' --yes')
