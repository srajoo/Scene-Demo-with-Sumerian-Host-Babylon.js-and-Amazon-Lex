# Harassment-Prevention

This is an application that uses BabylonJS, Amazon Lex, and Sumerian Host to create a VR based sexual harassment prevention training module.

### AWS Setup

In order for the demo to be runnable you will need to set up a few things in your AWS account. The steps below will guide you through creating a **Cognito Identity Pool** that allows this application to talk to two AWS services—Amazon Polly and Amazon Lex. You'll also create the actual **Amazon Lex chatbot** that powers this app.

#### App Credentials Setup

In order to allow our front-end application to make API calls to Amazon Lex and Amazon Polly we must create authorization credentials that it can use.

In the AWS console, navigate to the Cognito service.

Confirm that the Cognito console is set to your desired AWS region. (Example, "us-east-1")

Click **"Manage Identity Pools"**.

If you've never created an identity pool before you will be taken directly to the "Getting started wizard". If instead you see a dashboard view with a "Create new identity pool" button, click that button to be taken to the "Getting started wizard".

Give the identity pool a meaningful name specific to your application. We'll use the name *"Questionnaire"* for these instructions.

Tick the **"Enable access to unauthenticated identites"** checkbox to *ON*. This will allow anonymous web visitors to use our application.

Click the **"Create Pool"** button at the bottom of the page.

You will be presented with a page informing you that some IAM roles will be created on your behalf. If you expand the "View Details" section you'll see that two IAM roles will be created for you—one representing logged-in (authenticated) users of your app and one representing anonymous (unauthenticated) users. Click the **"Allow"** button at the bottom of the page.

You will be presented with a "Sample code" page. While you don't need most of the sample code presented, you ***must*** ✏️ copy the Identity pool ID value shown in the code, and save it for use later in these instructions. The value will look similar to `"us-east-1:1ab23f45-6789-8cde-7654-f1g0549h0cce"`

Use the AWS console search bar to navigate to the IAM service.

Click the **"Roles"** tab in the left nav.

Use the IAM Roles search field to search for the name you gave your Cognito Identity Pool (ex. *"Questionnaire"*). You should get two results—one with an "Unauth_Role" suffix and one with an "Auth_Role" suffix.

Click the role name of the "Unauth_Role" entry to access that IAM role.

Select **Add permissions > Attach policies**.

In the search box, search for *"AmazonLexRunBotsOnly"*. Tick the checkbox next to that policy to select it. This policy will allow our application to access Amazon Lex.

Click the **"Clear filters"** button, and use the search box again and search for *"AmazonPollyReadOnlyAccess"*. Tick the checkbox next to that policy to select it. This policy will allow our application to access Amazon Polly.

Now that you've selected the two permissions policies required by our application, click the **"Attach policies"** button.

In the resulting screen, confirm that both polices have been added to the list of permissions policies for the role.

Your app credentials setup is now complete! 🎉


#### Lex Bot Setup

From the AWS console, navigate to the Amazon Lex service.

Confirm that the Lex console is set to your desired AWS region. This must be the same region you chose when creating your Cognito Identity Pool.

If presented with a **"Get Started"** button, click it.

> ⚠️ By default you will be taken to the Lex V2 console. However, the bot used in this demo is only compatible with Lex V1. In the left-hand navigation, select "Return to the V1 console" before proceeding.

From the Bots tab, select **Actions > Import**.

Give the bot a name. We'll use the name *"Questionnaire"* for these instructions.

Import the "<repository-root>/amazon-lex/Questionnaire_1_ae006ac3-0a7d-4d39-b8a9-010f4ef40aff_Bot_LEX_V1.zip" file from your local computer.

After the bot definition has been imported you should see the bot listed in the console. Click the bot name to access the bot.

Click the **"Build"** button in the upper right-hand corner.

A message window will appear. Dismiss this window by clicking its **"Build"** button.

After the build completes click the **"Publish"** button.

When prompted, give the bot a meaningful alias. We'll use the alias *"Dev"* for these instructions. 

Click the **"Publish"** button to complete the publishing process.

Once publishing is complete, ✏️ write down the "Bot Name" and "Alias" values so you can easily refer to them later. You may dismiss the notification window after doing this.

Your Lex bot setup is now complete! 🎉

##Application

Make the following changes:

1. In js/main.js line 7, replace the `cognitoIdentityPoolId` value with the Cognito Identity Pool ID you created earlier. Save your changes.
2. In js/lex-bot.js change names of `botName` and `botAlias` if you want to create new LexBot.


##App Notes

The text-to-speech functionality is not working, I'm using an alert instead, you can find example at js/main.js line 113.
The button for switching scenes have not been enabled yet. For now, change value of "clicks" in line24 in js/main.js between 1 and 0 to switch. The code for button and toggle can be found in js/scene-room.js.
Microphone recording of audio is also under way. You can find code in js/conversation-controller.js, but it's not working as of now. Instead, keyboard keys you can use to simulate various spoken input values. To trigger these simulated speech inputs, press and release the "push-to-talk" button on screen while holding down one of the following keys:

**1** = Scene Complete. (That means start questionnaire)
**2** = 5
**y** = yes
**n** = no
If no key is pressed a value of "sssss" will be sent to Lex, representing unintelligble audio

Project Details:

### Changing the host character
If you'd like to change which host character is used, open main.js and edit the `characterId` value.

### Changing the host voice
If you'd like to change the voice used by the host, open the main.js fileand edit the `pollyVoice` value.

#### Script file overview

**main.js** 

This is the main entry point of the application.

**scene-room.js** 

The script handles loading and setup of the visual 3D environment of your scene. It also creates the camera used by the application.

**lex-bot.js** 

This script provides a simple API for interacting with any Lex bot.
