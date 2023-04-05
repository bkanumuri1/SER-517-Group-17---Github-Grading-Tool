import json
import secrets
from flask import Flask,request,jsonify, session, abort
import requests
from flask_cors import CORS
from datetime import datetime
# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)
CORS(app)
app.secret_key = secrets.token_hex(16)
CLIENT_ID = "e7231ef0e449bce7d695"
CLIENT_SECRET = "d8c966df9903e6e9fe3a3372708daea192bdd041"
repositories=[]
excelRepos=[]

@app.route('/getAccessToken', methods=['GET'])
def getAccessToken():
    args = request.args
    code = args.get("code")
    url = "https://github.com/login/oauth/access_token"
    headers = {'Accept':'application/json'}
    data = {
        'client_id':CLIENT_ID,
        'client_secret':CLIENT_SECRET,
        'code':code
    }
    response = requests.post(url,headers=headers,data=data)
    # TODO:  validate response and send appropriate results
    return response.json()

@app.route('/getUserData', methods=['GET'])
def getUserData():
    token = request.headers.get('Authorization')
    url = "https://api.github.com/user"
    headers = {'Authorization' : token}
    response = requests.get(url,headers=headers)
    session['username']=response.json()['login']
    return response.json()

@app.route('/getRepoContributors', methods=['GET'])
def getRepoContributors():
    token = request.headers.get('Authorization')
    repo_name = request.args.get("repo")
    url = "https://api.github.com/repos/"+repo_name+"/collaborators"
    headers = {'Authorization' : token}
    response = requests.get(url,headers=headers)
    data=response.json()
    if response.status_code == 200:
        contributors ={}
        for d in data:
            contributors[d['node_id']] = d['login']
        # print(contributors)
        return jsonify(contributors)
    else:
        print(data)
        abort(404)
        
@app.route('/getCommits', methods=['GET'])
def getCommits():
    token = request.headers.get('Authorization')
    repo_name = request.args.get("repo")
    contributor = request.args.get("author").split(":")[0]
    startDate = request.args.get("since")
    endDate = request.args.get("until")
    owner, repo = repo_name.split('/')
    print(contributor)
    variables = {
    "owner": owner,
    "name": repo,
    "login": contributor,
    "after": None,
    "since": startDate,
    "until": endDate
    }
    if (contributor == "0" or contributor == None):
        query = """
                query ($owner: String!, $name: String!, $since: GitTimestamp!, $until: GitTimestamp!, $after: String) {
                    repository(owner: $owner, name: $name) {
                        refs(refPrefix: "refs/heads/", orderBy: {direction: DESC, field: TAG_COMMIT_DATE}, first: 100){
                        pageInfo{
                            hasNextPage
                            endCursor
                            }
                            nodes{
                                name
                                target{
                                    ... on Commit {
                                        history(first: 100, since: $since, until: $until, after: $after) {
                                            pageInfo{
                                                hasNextPage
                                                endCursor
                                            }
                                            nodes{
                                                author{
                                                    user{
                                                        login
                                                    }
                                                },
                                                oid
                                                committedDate
                                                additions
                                                deletions
                                                commitUrl
                                                message
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                """
    elif(contributor != "0"):
        query = """
                query ($owner: String!, $name: String!, $login: ID!, $since: GitTimestamp!, $until: GitTimestamp!, $after: String) {
                    repository(owner: $owner, name: $name) {
                        refs(refPrefix: "refs/heads/", orderBy: {direction: DESC, field: TAG_COMMIT_DATE},first:100){
                        pageInfo{
                            hasNextPage
                            endCursor
                            }
                            nodes{
                                name
                                target{
                                    ... on Commit {
                                        history(author: {id: $login}, first: 100, since: $since, until: $until, after: $after) {
                                            pageInfo{
                                                hasNextPage
                                                endCursor
                                            }
                                            nodes{
                                                author{
                                                    user{
                                                        login
                                                    }
                                                },
                                                oid
                                                committedDate
                                                additions
                                                deletions
                                                commitUrl
                                                message
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                """
    # has_next_page = True
    # while has_next_page:
        # Convert the query and variables to a JSON string
    data = {
            "query": query,
            "variables": variables
        }
    json_data = json.dumps(data)
    headers = {'Authorization' : token}
    url = 'https://api.github.com/graphql' 
        
        # Send the GraphQL request
    response = requests.post(url, headers=headers, data=json_data)
        # Parse the response data
        # data = response.json()["data"]["repository"]["refs"]["nodes"]
        # for node in data:
        #     branch_name = node["name"]
        #     commits = node["target"]["history"]["nodes"]
        #     for commit in commits:
        #         print(f"Branch: {branch_name}, Commit: {commit['oid']}")

        # Check if there are more pages to fetch
        # has_next_page = response.json()["data"]["repository"]["refs"]["pageInfo"]["hasNextPage"]
        # if has_next_page:
        #     end_cursor = response.json()["data"]["repository"]["refs"]["pageInfo"]["endCursor"]
        #     variables["after"] = end_cursor
    print(response.json())    
    return jsonify(parseCommitData(response.json()))
    

def parseCommitData(response):
     oidList = set()
     nodes = response['data']['repository']['refs']['nodes']
     parsedCommitList={}
     dataToSend = []
     for branch in nodes:
          branchName = branch['name']
          commitsOnBranch = branch['target']['history']['nodes']
          for commit in commitsOnBranch:
               if(commit['oid'] in oidList):
                    continue
               oidList.add(commit['oid'])
               date = datetime.strptime(commit['committedDate'], '%Y-%m-%dT%H:%M:%SZ')
               formatted_date = date.strftime('%Y-%m-%d')
               if formatted_date in parsedCommitList:
                    parsedCommitList[formatted_date].append(constructEachCommitEntry(commit,branchName))
               else:
                    parsedCommitList[formatted_date] = [constructEachCommitEntry(commit,branchName)]
    
     for cdate in parsedCommitList.keys():
        entry = {}
        entry['date'] = cdate
        entry['commit_count'] = len(parsedCommitList.get(cdate))
        entry['commit_details'] = parsedCommitList.get(cdate)
        dataToSend.append(entry)
    
     print(dataToSend)
     return dataToSend
          
def constructEachCommitEntry(commit,branchName):
        commmit_entry = {}
        commmit_entry['oid'] = commit['oid']
        commmit_entry['branch'] = branchName
        commmit_entry['additions'] = commit['additions']
        commmit_entry['deletions'] = commit['deletions']
        commmit_entry['author'] = commit['author']['user']['login']
        commmit_entry['html_url'] = commit['commitUrl']
        commmit_entry['message'] = commit['message']
        return commmit_entry



@app.route('/getPRs', methods=['GET'])
def getPRs():
    token = request.headers.get('Authorization')
    repo_name = request.args.get("repo")
    contributor = request.args.get("author").split(":")[1]
    startDate = request.args.get("since")
    endDate = request.args.get("until")
    url = "https://api.github.com/repos/" + repo_name +"/pulls?state=all"
    headers = {'Authorization' : token}
    response = requests.get(url,headers=headers)
    return jsonify(parsePullRequestData(response.json(),repo_name, contributor,startDate,endDate))

def constructEachPullRequestEntry(pullrequest):
        pr_entry = {}
        pr_entry['number'] = pullrequest['number']
        pr_entry['date'] = pullrequest['created_at']
        pr_entry['author'] = pullrequest['user']['login']
        pr_entry['html_url'] = pullrequest['html_url']
        pr_entry['title'] = pullrequest['title']
        pr_entry['head_branch'] = pullrequest['head']['ref']
        pr_entry['base_branch'] = pullrequest['base']['ref']
        reviewers = ", ".join([reviewer['login'] for reviewer in pullrequest['requested_reviewers']])
        pr_entry['reviewers'] = reviewers
        pr_entry['review_comments'] = pullrequest['review_comments']
        return pr_entry
    
def parsePullRequestData(data,repo_name,contributor,startDate,endDate):
    token = request.headers.get('Authorization')
    headers = {'Authorization' : token}
    sdate = datetime.strptime(startDate, '%Y-%m-%dT%H:%M:%SZ')
    sdate = sdate.strftime('%Y-%m-%d')
    edate = datetime.strptime(endDate, '%Y-%m-%dT%H:%M:%SZ')
    edate = edate.strftime('%Y-%m-%d')
    dataToSend = []
    parsedPRList={}
    for pullrequest in data:
        user = pullrequest['user']['login']
        pr_url = pullrequest['url']
        pr_number = pr_url.rsplit('/',1)[-1]
        url = "https://api.github.com/repos/" + repo_name + "/issues/" + pr_number + "/comments"
        review_comments = requests.get(url, headers=headers).json()
        filtered_comments = []
        for comment in review_comments:
                commented_reviewer = comment["user"]["login"]
                review_posted = comment["body"]
                posted_comment = commented_reviewer + " -> "+ review_posted
                filtered_comments.append(posted_comment)
        if filtered_comments:
            filtered_comments = ", ".join([comment for comment in filtered_comments])
            pullrequest['review_comments'] = filtered_comments
        else:
            pullrequest['review_comments'] = ''
        if(user == contributor or contributor=='all' or contributor is None):
            date = datetime.strptime(pullrequest['created_at'], '%Y-%m-%dT%H:%M:%SZ')
            formatted_date = date.strftime('%Y-%m-%d')
            if not (formatted_date >= sdate and formatted_date <= edate):
                continue
            # parsedPRCount[formatted_date] =parsedPRCount.get(formatted_date,0)+1
            if formatted_date in parsedPRList:
                parsedPRList[formatted_date].append(constructEachPullRequestEntry(pullrequest))
            else:
                parsedPRList[formatted_date] = [constructEachPullRequestEntry(pullrequest)]

    for pDate in parsedPRList.keys():
        entry = {}
        entry['date'] = pDate
        entry['pr_count'] = len(parsedPRList.get(pDate))
        entry['pr_details'] = parsedPRList.get(pDate)
        dataToSend.append(entry)
    return dataToSend


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=9000, debug=True)
