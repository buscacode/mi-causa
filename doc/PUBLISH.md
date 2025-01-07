# NPM

to create a link and test the package in local, use the command:

```
npm link
```

it will create a link into the global npm package libraries that you can use into a test project
create by `npm init`
To include this package linked you should run:

```
npm link <package-name>
```

you can see the name of the package running `npm -g list`

## version

```
npm version prerelease --preid=alpha
```

## publish tags

```
git push --tags
```

### view versions

```
pnpm view mi-causa versions
```
