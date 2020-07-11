# LitElement

  

Extended version of [LitElement](https://lit-element.polymer-project.org).

It adds few features required in development environment.

  

It's mainly develop to debug any performance issue in the element due to redundant render/updates.

When proper caution isn't taken then many time it's found that element is re-rendered/updated though completely

irrelevant redux state is changed.

  

> Introduced since version 1.1

  

## Usage

  

```javascript

  

import { LitElement } from  "@dw/pwa-helpers/lit-element";

  

class  MyView  extends  LitElement {

//View logic goes here

}

```

  

For the production (non-development) environment, You may like to disable all these features just enabled

for the development environment. To do that, just set following Global JS variable.

  

```javascript

window.dw.pwaHelpers.LitElementConfig.disabled = true;

```

  

When disabled, it just exports [LitElement](https://lit-element.polymer-project.org) again, without any change.

  

## Features

-  [viewId](#view-id)

- [Element updates or render count](#updates-or-render-count)

- [Debug changed properties](#debug-changed-properties)

- [Mandatory and Constant property observation](#mandatory-and-constant-property-observation)

  
  

### viewId

Assigns unique viewId to each element instance. It can be used in log statements to identify which element

generated the log. It's accessible through property `_viewId`.

  
  

viewId is generated from element-name and auto-incremented sequence number. e.g. `kerika-card-1`.

Separate sequence number is managed per element-name. e.g.

- for the first created `kerika-card` element will be assigned id = `kerika-card-1`.

- Next created `kerika-card` element will be assigned id = `kerika-card-2`.

- Next created `kerika-chat-message` element will be assigned id = `kerika-chat-messsage-1`.

  

### Updates or Render count

- It tracks that how many instances was created of Custrom Element and how many times it was updated. So integrator can easily identify that how many times its component was rendered.

- It provides two static method

-  `LitElement.getUpdatedSummary()`: Returns components updated summary.

-  `LitElement.clearUpdatedSummary()`: Reset updated components summary.

  
  
  

### Debug changed properties

Set `dw.pwaHelpers.LitElementConfig.debugPropChanges=true`. And you will get a console log when any property of the

element is changed. It explains about which property is changed, what was the old value & what's new value.

  
  

### Mandatory and Constant property observation

-  **Mandatory properties** are property which must be available when element is attached to the document. (In `connectedCallback`)

-  **Constant properties** are the property which must not be changed after element is attached.

- You will see ERROR log in the console when any mandatory property is missing. And WARN log when constant property is changed.

- Mandatory properties can be defined through instance variable `mandatoryProps` & Constant properties through `constantProps`.

e.g.

  

```javascript

  

class  KerikaTaskItem  extends  LitElement {

  

constructor(){

super();

// Define list of mandatory properties which must be available in `connectedCallback`.

this.mandatoryProps = ['taskId'];

  

// Define list of constant properties which must not be changed once it is set. Most of the case it must be available in `connectedCallback`.

this.constantProps = ['taskId', 'list'];

}

}
```