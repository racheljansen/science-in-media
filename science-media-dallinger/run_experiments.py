
import sys,os
import uuid

mode = sys.argv[1]

exp_file = 'data/cogsci-experiments.csv'

n_reps = 2
versions = ['0','2']
stories = ['1','2']

for code_version in versions:
    for story_num in stories:
        for rep in range(n_reps):
            
            print('\n')
            print('Running code ' + code_version + ', story ' +  story_num + ', rep ' + str(rep))
            
            exp_id = str(uuid.uuid4())

            config = "[Experiment]\nmode = sandbox\nauto_recruit = true\nwebdriver_type = phantomjs\ngroup_name = science_media\n\n[MTurk]\ntitle = Thinking about science (UID=" + exp_id + ")\ndescription = Read a brief article and then answer a survey.\nkeywords = Psychology, reading, science\nbase_payment = 1.50\nlifetime = 24\nduration = 1.0\nus_only = true\napprove_requirement = 95\ncontact_email_on_error = pkrafft@csail.mit.edu\nad_group = Science Media " + exp_id + "\norganization_name = UC Berkeley\nbrowser_exclude_rule = MSIE, mobile, tablet\nqualification_blacklist = science_media\n\n[Database]\ndatabase_url = postgresql://postgres@localhost/dallinger\ndatabase_size = standard-0\n\n[Server]\ndyno_type = standard-2x\nnum_dynos_web = 2\nnum_dynos_worker = 1\nhost = 0.0.0.0\nnotification_url = None\nclock_on = false\nlogfile = -\n"

            version = "var version = " + code_version + "\n"

            article = "stories = ['article" + story_num + ".html']\n"

            with open('config.txt', 'w') as f:
                f.write(config)

            with open('stories.py', 'w') as f:
                f.write(article)

            with open('static/scripts/mode.js', 'w') as f:
                f.write(version)

            out_file = 'data/' + exp_id + '.out'

            with open(out_file, 'w') as f:
                f.write(config)
                f.write(version)
                f.write(article)

            success = False
            while not success:

                print('Attempting to deploy...')

                os.system('dallinger ' + mode + ' >> ' + out_file + " 2>&1")

                if mode == 'debug':
                    success = True
                else:
                    with open(out_file) as f:

                        last_line = f.readlines()[-1]

                        success = 'Completed deployment of experiment' in last_line
                        if not success:
                            dlgr_id = last_line.split("'")[8].split('-')[1]
                            os.system('dallinger destroy --app ' + dlgr_id + ' --yes >> ' + out_file + " 2>&1")
                        else:
                            dlgr_id = last_line.split(' ')[-1].strip()[:-1]
                            with open(exp_file, 'a') as g:
                                g.write(','.join([exp_id,dlgr_id,code_version,story_num,str(rep)]) + '\n')

