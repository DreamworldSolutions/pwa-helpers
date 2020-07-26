# LitElement

An extended version of [LitElement](https://lit-element.polymer-project.org).

It adds few features required for easy debugging of the issues and following standard practices.
It was initially developed to debug any performance issues in the element due to extra/redundant render/updates.

> Introduced since version 1.1
  
## Usage
 

```javascript

import { LitElement } from  "@dw/pwa-helpers/lit-element";

class  MyView  extends  LitElement {

//View logic goes here

}
```

## Features

### viewId
Assigns unique viewId to each element instance. It can be used in log statements to identify which element
generated the log. It's accessible through property `_viewId`.

viewId is generated from element-name and auto-incremented sequence number. For example if element name is `kerika-card`
first instance of the view will be assigned an id `kerika-card-1`, then `kerika-card-2` and so on.

Separate sequence number is managed per element-name. e.g.
- for the first created `kerika-card` element will be assigned id = `kerika-card-1`.
- Next created `kerika-card` element will be assigned id = `kerika-card-2`.
- Next created `kerika-chat-message` element will be assigned id = `kerika-chat-messsage-1`.

### Updates or Render count
It manages the count about how many times a view element is rendered/updated. It could be helpful for the performance issue debugging. 
Very much useful when view element is updated on the redux state. It's quite possible that a view element is updated on unrelevant
redux state changes.

Usage:
1. Before performing test, you would like to reset the render counts to 0. For that, run `LitElement.clearUpdatedSummary()` from the develoepr console.
2. Perform the UI actions which is suspecious to the performance. 
3. Run `LitElement.getUpdatedSummary()` from the Developer Console to know about the render counts for each view elements.


> This feature is disabled by default, as it's useful/required only for the development environment.
> To enable it set a global variable `dw.pwaHelpers.LitElementConfig.debugRender=true`.

### Debug changed properties
This feature is disabled by default. Set `dw.pwaHelpers.LitElementConfig.debugPropChanges=true` to enable it.

After enabled, you will get a console log when any property of an element is changed. 
It explains about which property is changed, what was the old value & what's new value.

### Mandatory and Constant property observation
-  **Mandatory properties** are property which must be available when element is attached to the document. (In `connectedCallback`)
Though, value of such property could be changed later on.
-  **Constant properties** are the property which must not be changed after element is attached. Though, it's not necessary that 
a constant propery be a mandatory property. If a constant property isn't an mandatory property, it could be left undefined, but it
can't be changed later on.

Usage: 

Mandatory properties can be defined through instance variable `mandatoryProps` & Constant properties through `constantProps`.

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

You will see an ERROR log in the console when any mandatory property is missing. And WARN log when constant property is changed.

### Avoid extra rendering
LitElement provides a life-cycle method [shouldUpdate](https://lit-element.polymer-project.org/guide/lifecycle#shouldupdate) to control whether an element should be rendered or not on a property chnage. 

It's used to avoid extra rendering when element is detached (or disconnected) OR `active` property is `false`.

It's exact behavior is as follows:  
- Rendering is skipped if the element is detached/disconnected.
- When `active` property turns to `false` from `true`, then rendering isn't skipped.
- But, after that whenever any other property changes during `active=false` state, then rendering is skipped.

#### Implementation Notes

**Q: why does it render when `active` turns to `false` from `true`?**
A: When an element becomes in-active, all of it's children elements (local DOMs) should also become inactive. 
So, if we don't allow rendering this time, children's property will not be updated. And it will 

**Default value of active property?**
When element is initialized, default value of the `active` property is set to `true`. So, it works without any side-effect for the
users who don't want to use this feature.


## Disable Completely
When application uses this `LitElement`, and sometimes you suspect that by using this application is causing a specific issue(s).
In such a case, to validate your suspection you might need to update all of the application code to update the import statement
to the raw [LitElement](https://lit-element.polymer-project.org). Right?

No. It's not needed. You can just configure the following global property/variable.

```javascript
dw.pwaHelpers.LitElementConfig.disabled=true;
```

When it's disabled, raw LitElement class is re-exported by this module.