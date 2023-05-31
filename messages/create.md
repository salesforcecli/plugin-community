# summary

Create an Experience Cloud site using a template.

# description

Run the "community list template" command to see the templates available in your org. See 'Which Experience Cloud Template Should I Use?' in Salesforce Help for more information about the different template types available. (https://help.salesforce.com/s/articleView?id=sf.siteforce_commtemp_intro.htm&type=5)

When you create a site with the Build Your Own (LWR) template, you must also specify the AuthenticationType value using the format templateParams.AuthenticationType=value, where value is AUTHENTICATED or AUTHENTICATED_WITH_PUBLIC_ACCESS_ENABLED. Name and values are case-sensitive. See 'DigitalExperienceBundle' in the Metadata API Developer Guide for more information. (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_digitalexperiencebundle.htm)

The site creation process is an async job that generates a jobId. To check the site creation status, query the BackgroundOperation object and enter the jobId as the Id. See ‘BackgroundOperation’ in the Object Reference for the Salesforce Platform for more information. (https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_backgroundoperation.htm)

If the job doesn’t complete within 10 minutes, it times out. You receive an error message and must restart the site creation process. Completed jobs expire after 24 hours and are removed from the database.

When you run this command, it creates the site in preview status, which means that the site isn't yet live. After you finish building your site, you can make it live.

If you have an Experience Builder site, publish the site using the "community publish" command to make it live.

If you have a Salesforce Tabs + Visualforce site, to activate the site and make it live, update the status field of the Network type in Metadata API. (https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_network.htm) Alternatively, in Experience Workspaces, go to Administration | Settings, and click Activate.

For Experience Builder sites, activating the site sends a welcome email to site members.

# examples

- Create an Experience Cloud site using template 'Customer Service' and URL path prefix 'customers':

  <%= config.bin %> <%= command.id %> --name 'My Customer Site' --template-name 'Customer Service' --url-path-prefix customers --description 'My customer site'

- Create a site using 'Partner Central' template:

  <%= config.bin %> <%= command.id %> --name partnercentral --template-name 'Partner Central' --url-path-prefix partners

- Create a site using the 'Build Your Own (LWR)' template with authentication type of UNAUTHENTICATED:

  <%= config.bin %> <%= command.id %> --name lwrsite --template-name 'Build Your Own (LWR)' --url-path-prefix lwrsite templateParams.AuthenticationType=UNAUTHENTICATED

# flags.name.summary

Name of the site to create.

# flags.templateName.summary

Template to use to create a site.

# flags.templateName.description

An example of a template is Customer Service. Run the "community template list" command to see which templates are available in your org.

# flags.urlPathPrefix.summary

URL to append to the domain created when Digital Experiences was enabled for this org.

# flags.urlPathPrefix.description

For example, if your domain name is https://MyDomainName.my.site.com and you create a customer site, enter 'customers' to create the unique URL https://MyDomainName.my.site.com/customers.

# flags.description.summary

Description of the site.

# flags.description.description

The description displays in Digital Experiences - All Sites in Setup and helps with site identification.

# response.action

Site creation is under way. To track its status, query the BackgroundOperation object and include the jobId.

# response.styleHeader

Create Site Result

# response.createMessage

Your Site is being created.

# error.invalidVarargs

The following varargs were invalid or unsupported: %s
