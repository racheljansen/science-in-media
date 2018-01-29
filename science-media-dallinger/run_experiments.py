
import sys,os
import uuid

mode = sys.argv[1]

exp_id = str(uuid.uuid4())

config = "[Experiment]\nmode = sandbox\nauto_recruit = true\nwebdriver_type = phantomjs\ngroup_name = science_media\n\n[MTurk]\ntitle = Thinking about science\ndescription = Read a brief article and then answer a survey.\nkeywords = Psychology, reading, science\nbase_payment = 1.50\nlifetime = 24\nduration = 1.0\nus_only = true\napprove_requirement = 95\ncontact_email_on_error = pkrafft@csail.mit.edu\nad_group = Science Media " + exp_id + "\norganization_name = UC Berkeley\nbrowser_exclude_rule = MSIE, mobile, tablet\nqualification_blacklist = science_media\n\n[Database]\ndatabase_url = postgresql://postgres@localhost/dallinger\ndatabase_size = standard-0\n\n[Server]\ndyno_type = standard-2x\nnum_dynos_web = 2\nnum_dynos_worker = 1\nhost = 0.0.0.0\nnotification_url = None\nclock_on = false\nlogfile = -"

version = "var version = 0"

article = "stories = ['article2.html']"

with open('config.txt', 'w') as f:
    f.write(config)

with open('stories.py', 'w') as f:
    f.write(article)
    
with open('static/scripts/mode.js', 'w') as f:
    f.write(version)

success = False
while not success:
    
    os.system('dallinger ' + mode + ' > data/' + exp_id + '.out')

    success = True
    



