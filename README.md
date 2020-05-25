Example GIT+SSH Server
----------------------

A small git/ssh server for hosting repos and running custom logic after push.

# Features

- `git push`, `git pull` & `git clone` are supported.
- Authentication is done via public keys exclusively. (no passwords allowed)
- Repos & public keys are stored on disk.
- Repos are automatically created on-demand (first push).
- Server-side hooks like `pre-receive`, `update` & `post-receive` can be applied to all repos.

## Setup

Get the latest code:

```bash
git clone joshnuss/git-ssh-server
cd git-ssh-server
yarn
```

Create a host key:

```bash
ssh-keygen host.key
```

Add `.pub` public keys to the `keys` folder:

```bash
# if using locally
cp ~/.ssh/id_rsa.pub keys/me.pub
```

Add git hooks like `pre-receive`, `update` &  `post-receive` to the `hooks` folder (optional).

Example `post-receive` hook:

```bash
#!/bin/bash

while read oldrev newrev ref
do
    if [[ $ref =~ .*/master$ ]];
    then
        echo "Master ref received.  Deploying master branch to production..."
        git --work-tree=/var/www/html --git-dir=/home/demo/proj checkout -f
    else
        echo "Ref $ref successfully received.  Doing nothing: only the master branch may be deployed on this server."
    fi
done
```

Hooks are symlinked on first push.

## Usage

Start the server:

```bash
PORT=22755 ADDRESS=localhost PASSPHRASE=foobar yarn start
```

In your local repo:

```bash
# add a remote
git remote add hosting ssh://git@localhost:22755/your-repo-name

# OR if you're using a standard SSH port 22
git remote add hosting git@mydomain.tld/your-repo-name

# push to remote
git push hosting master
```

## License

MIT
