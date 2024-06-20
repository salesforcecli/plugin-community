# plugin-community;

[![NPM](https://img.shields.io/npm/v/@salesforce/plugin-community.svg?label=@salesforce/plugin-community)](https://www.npmjs.com/package/@salesforce/plugin-community) [![Downloads/week](https://img.shields.io/npm/dw/@salesforce/plugin-community.svg)](https://npmjs.org/package/@salesforce/plugin-community) [![License](https://img.shields.io/badge/License-BSD%203--Clause-brightgreen.svg)](https://raw.githubusercontent.com/salesforcecli/plugin-community/main/LICENSE.txt)

## Learn about the plugin-community

Use the community commands to create and publish an Experience Cloud site, and view a list of available templates in you org.

This plugin is bundled with the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli). For more information on the CLI, read the [getting started guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm).

We always recommend using the latest version of these commands bundled with the CLI, however, you can install a specific version or tag if needed.

## Install

```bash
sfdx plugins:install community@x.y.z
```

## Issues

Please report any issues at https://github.com/forcedotcom/cli/issues

## Contributing

1. Please read our [Code of Conduct](CODE_OF_CONDUCT.md)
2. Create a new issue before starting your project so that we can keep track of
   what you are trying to add/fix. That way, we can also offer suggestions or
   let you know if there is already an effort in progress.
3. Fork this repository.
4. [Build the plugin locally](#build)
5. Create a _topic_ branch in your fork. Note, this step is recommended but technically not required if contributing using a fork.
6. Edit the code in your fork.
7. Write appropriate tests for your changes. Try to achieve at least 95% code coverage on any new code. No pull request will be accepted without unit tests.
8. Sign CLA (see [CLA](#cla) below).
9. Send us a pull request when you are done. We'll review your code, suggest any needed changes, and merge it in.

### CLA

External contributors will be required to sign a Contributor's License
Agreement. You can do so by going to https://cla.salesforce.com/sign-cla.

### Build

To build the plugin locally, make sure to have yarn installed and run the following commands:

```bash
# Clone the repository
git clone git@github.com:salesforcecli/plugin-community

# Install the dependencies and compile
yarn install
yarn build
```

To use your plugin, run using the local `./bin/dev` or `./bin/dev.cmd` file.

```bash
# Run using local run file.
./bin/dev community
```

There should be no differences when running via the Salesforce CLI or using the local run file. However, it can be useful to link the plugin to do some additional testing or run your commands from anywhere on your machine.

```bash
# Link your plugin to the sfdx cli
sfdx plugins:link .
# To verify
sfdx plugins
```

## Commands

<!-- commands -->

- [`sf community create`](#sf-community-create)
- [`sf community list template`](#sf-community-list-template)
- [`sf community publish`](#sf-community-publish)

## `sf community create`

Create an Experience Cloud site using a template.

```
USAGE
  $ sf community create -n <value> -t <value> -o <value> [--json] [--flags-dir <value>] [-p <value>] [-d <value>]
    [--api-version <value>]

FLAGS
  -d, --description=<value>      Description of the site.
  -n, --name=<value>             (required) Name of the site to create.
  -o, --target-org=<value>       (required) Username or alias of the target org. Not required if the `target-org`
                                 configuration variable is already set.
  -p, --url-path-prefix=<value>  URL to append to the domain created when Digital Experiences was enabled for this org.
  -t, --template-name=<value>    (required) Template to use to create a site.
      --api-version=<value>      Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Create an Experience Cloud site using a template.

  Run the "community list template" command to see the templates available in your org. See 'Which Experience Cloud
  Template Should I Use?' in Salesforce Help for more information about the different template types available.
  (https://help.salesforce.com/s/articleView?id=sf.siteforce_commtemp_intro.htm&type=5)

  When you create a site with the Build Your Own (LWR) template, you must also specify the AuthenticationType value
  using the format templateParams.AuthenticationType=value, where value is AUTHENTICATED or
  AUTHENTICATED_WITH_PUBLIC_ACCESS_ENABLED. Name and values are case-sensitive. See 'DigitalExperienceBundle' in the
  Metadata API Developer Guide for more information.
  (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_digitalexperiencebundle.htm)

  The site creation process is an async job that generates a jobId. To check the site creation status, query the
  BackgroundOperation object and enter the jobId as the Id. See ‘BackgroundOperation’ in the Object Reference for the
  Salesforce Platform for more information. (https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/obj
  ect_reference/sforce_api_objects_backgroundoperation.htm)

  If the job doesn’t complete within 10 minutes, it times out. You receive an error message and must restart the site
  creation process. Completed jobs expire after 24 hours and are removed from the database.

  When you run this command, it creates the site in preview status, which means that the site isn't yet live. After you
  finish building your site, you can make it live.

  If you have an Experience Builder site, publish the site using the "community publish" command to make it live.

  If you have a Salesforce Tabs + Visualforce site, to activate the site and make it live, update the status field of
  the Network type in Metadata API.
  (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_network.htm) Alternatively, in
  Experience Workspaces, go to Administration | Settings, and click Activate.

  For Experience Builder sites, activating the site sends a welcome email to site members.

ALIASES
  $ sf force community create

EXAMPLES
  Create an Experience Cloud site using template 'Customer Service' and URL path prefix 'customers':

    $ sf community create --name 'My Customer Site' --template-name 'Customer Service' --url-path-prefix customers \
      --description 'My customer site'

  Create a site using 'Partner Central' template:

    $ sf community create --name partnercentral --template-name 'Partner Central' --url-path-prefix partners

  Create a site using the 'Build Your Own (LWR)' template with authentication type of UNAUTHENTICATED:

    $ sf community create --name lwrsite --template-name 'Build Your Own (LWR)' --url-path-prefix lwrsite \
      templateParams.AuthenticationType=UNAUTHENTICATED

FLAG DESCRIPTIONS
  -d, --description=<value>  Description of the site.

    The description displays in Digital Experiences - All Sites in Setup and helps with site identification.

  -p, --url-path-prefix=<value>

    URL to append to the domain created when Digital Experiences was enabled for this org.

    For example, if your domain name is https://MyDomainName.my.site.com and you create a customer site, enter
    'customers' to create the unique URL https://MyDomainName.my.site.com/customers.

  -t, --template-name=<value>  Template to use to create a site.

    An example of a template is Customer Service. Run the "community template list" command to see which templates are
    available in your org.
```

_See code: [src/commands/community/create.ts](https://github.com/salesforcecli/plugin-community/blob/3.2.20/src/commands/community/create.ts)_

## `sf community list template`

Retrieve the list of templates available in your org.

```
USAGE
  $ sf community list template -o <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Retrieve the list of templates available in your org.

  See 'Which Experience Cloud Template Should I Use?'
  (https://help.salesforce.com/s/articleView?id=sf.siteforce_commtemp_intro.htm&type=5) in Salesforce Help for more
  information about the different template types available for Experience Cloud.

ALIASES
  $ sf force community template list

EXAMPLES
  Retrieve the template list from an org with alias my-scratch-org:

    $ sf community list template --target-org my-scratch-org
```

_See code: [src/commands/community/list/template.ts](https://github.com/salesforcecli/plugin-community/blob/3.2.20/src/commands/community/list/template.ts)_

## `sf community publish`

Publish an Experience Builder site to make it live.

```
USAGE
  $ sf community publish -n <value> -o <value> [--json] [--flags-dir <value>] [--api-version <value>]

FLAGS
  -n, --name=<value>         (required) Name of the Experience Builder site to publish.
  -o, --target-org=<value>   (required) Username or alias of the target org. Not required if the `target-org`
                             configuration variable is already set.
      --api-version=<value>  Override the api version used for api requests made by this command

GLOBAL FLAGS
  --flags-dir=<value>  Import flag values from a directory.
  --json               Format output as json.

DESCRIPTION
  Publish an Experience Builder site to make it live.

  Each time you publish a site, you update the live site with the most recent updates. When you publish an Experience
  Builder site for the first time, you make the site's URL live and enable login access for site members.

  In addition to publishing, you must activate a site to send a welcome email to all site members. Activation is also
  required to set up SEO for Experience Builder sites. To activate a site, update the status field of the Network type
  in Metadata API. (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_network.htm)
  Alternatively, in Experience Workspaces, go to Administration | Settings, and click Activate.

  An email notification informs you when your changes are live on the published site. The site publish process is an
  async job that generates a jobId. To check the site publish status manually, query the BackgroundOperation object and
  enter the jobId as the Id. See ‘BackgroundOperation’ in the Object Reference for the Salesforce Platform for more
  information. (https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_obje
  cts_backgroundoperation.htm)

  If the job doesn’t complete within 15 minutes, it times out. You receive an error message and must restart the site
  publish process. Completed jobs expire after 24 hours and are removed from the database.

ALIASES
  $ sf force community publish

EXAMPLES
  Publish the Experience Builder site with name "My Customer Site':

    $ sf community publish --name 'My Customer Site'
```

_See code: [src/commands/community/publish.ts](https://github.com/salesforcecli/plugin-community/blob/3.2.20/src/commands/community/publish.ts)_

<!-- commandsstop -->
