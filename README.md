# Deploygirl
Low ceremony super hero application deployment

## Setup and Starting

```
npm i deploygirl -g

./deploygirl
```

**deploygirl is quite silent by default. If you whish deploygirl to emit more logs set the environment variable `DEBUG` to `deploygirl*`**

### API Key
Anyone with an (in our case *the*) API Key can deploy and thus execute scripts
using deploy scripts. We strongly recommend to set a real deploy key upon installation

To use a custom API key create a configuration file in `/etc/deploygirlrc`

```
{
  apiKey: 'ThisIsYourAPIKeyAndItsWorthToSpendSomeCharactersHere',
}
```

### SSL
Deploygirl uses SSL by default. On every startup a (new) self signed certificate is
created. To use a custom certificate create a configuration file in `/etc/deploygirlrc`
and add the key and cert path of your SSL certificate.

```
{
  ssl: {
    // Uncomment these lines if you want to your own self signed certificate
    // deploygirl always starts a SSL server but creates a self signed certificate
    // on the fly if keyFile and certFile are not set

    // keyFile:
    // certFile:
  }
});
```

See section "Configuration" for additional configuration options 

### CORS
If you plan to integrate deploygirl into some dashboard you'll probably need to configure CORS to 
get cross domain requests working.

Deploygirl is prepared!

```
{
  // CORS options. See https://github.com/expressjs/cors for more options
  cors: {
    origin: false // Disable cors by default
  }
}
```

## Configuration
Deploygirl uses rc (https://www.npmjs.com/package/rc) under the hood to load configurations.

* environment variables prefixed with deploygirl_ 
    * or use "__" to indicate nested properties (e.g. appname_foo__bar__baz => foo.bar.baz)
* if you passed an option --config file then from that file
* a local .deploygirlrc or the first found looking in ./ ../ ../../ ../../../ etc.
* $HOME/.deploygirlrc
* $HOME/.deploygirl/config
* $HOME/.config/deploygirl
* $HOME/.config/deploygirl/config
* /etc/deploygirlrc
* /etc/deploygirl/config

### Default Configuration
```
{
  port: '3030',
  hostname: undefined, // Listen on all ports

  // API Key sent via basic auth
  apiKey: 'c3po',

  // Temporary deployment package upload directory
  uploadDir: os.tmpdir(),

  // Deployment working directory.
  // For every application a sub directory is created.
  deployDir: path.join(__dirname, '..', '.deployments'),

  // CORS options. See https://github.com/expressjs/cors for more options
  cors: {
    origin: false // Disable cors by default
  },

  ssl: {
    // Uncomment these lines if you want to your own self signed certificate
    // deploygirl always starts a SSL server but creates a self signed certificate
    // on the fly if keyFile and certFile are not set

    // keyFile:
    // certFile:
  }
}
```

## API

**All API requests require authentication using a configured API key**. The API key
may be passed as basic auth or as url parameter. Deploygirl listens by default on port 3030 on all
interfaces!

`curl https://localhost:3030/applications?key=c3po --insecure`

is equivalent to

`curl https://whateverusername:c3po@localhost:3030/applications --insecure`

Curl option `--insecure` is used since we used self signed certificates.



**Routes**

`GET /applications`
Gets a list of application ids

`PUT /applications/:applicationId` 
Creates a new application with id :applicationId

`GET /applications/:applicationId`
Gets detail for one application with id :applicationId

`GET /applications/:applicationId/deployments`
Gets a list of deployments for an application including deployment state.

`POST /applications/:applicationToCreate/deployments`
Creates a new deployment. A multipart form-data request is expected including one
arbitrary named tar gz file containing the deployment package.

### Deployment Package
Deploygirl expects a directory named `.deploy` containing a file named `deploy.*` (sh, cmd, whatever) 
that is executed by deploygirl in a directory containing the extracted untared deployment package.

See example/bash for more detail.