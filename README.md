Example GIT+SSH Server
----------------------

A small git/ssh server for storing repos.

# Features

- `git push`, `git pull` & `git clone` are supported
- Authentication is done with public keys. (no passwords allowed)
- Repos & public keys are stored on disk
- Repos are automatically created on first push

# Setup

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

Add `.pub` public keys to `keys` folder

# Usage

Start the server:

```bash
PORT=22755 DOMAIN=localhost yarn start
```

In your local repo:

```bash
# add a remote
git remote add hosting ssh://git@localhost:22755/example

# push to remote
git push hosting master
```

# License

MIT
