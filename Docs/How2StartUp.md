

# to start with,

"npm install" to get all the necessary packages

# To see a preview:

Do "npm run mini" to see the preview instantly, if you haven't yet created a mongo_db uri to put in env yet

in the preview version, *data won't persist, errs don't appear when editing the profile with invalid data, its very buggy, and thus the tests using it wont work, trading does work though, feedback is instant, its offline and in memory instead of a database, and its so you don't have to put a mongodb uri link in env to view it

# For the full working version:

1. create a new .env file at the project root
2. make sure .env has all information, see: [Env Vars](/EnvVars.txt)

3. get cluster string from mongo db atlas and put it into .env
4. allow mongo db atlas to use your IP on your local machine, it can change when you power off so you'll have to reenable it!

5. "npm run dev" to run it!
6. do "npm run test" to run all test cases

