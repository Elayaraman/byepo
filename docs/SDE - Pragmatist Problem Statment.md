Byepo Technologies No. 28, Vaidyaraman Street, T. Nagar, Chennai 

## **Assignment: Multi-Tenant Feature Flag Management System** 

## **Overview** 

Build a small **SaaS - like feature-flag management system** with **three separate front-end applications** and a **Node.js backend** . The front-end doesn’t have to look polished and professional. Basic UI usability is enough. Candidates can use AI, but should use it as a mere accelerator to execute your ideas into code. If the AI ideates, we believe your ability to come up with innovations would be stifled. 

The system allows: 

- A **Super Admin** to create organizations 

- **Organization Admins** to manage feature flags 

- **End Users** to check whether specific features are enabled for their organization 

This assignment is designed to evaluate your ability to design APIs, model data, manage roles, and make practical engineering trade-offs. 

## **Tech Constraints** 

- **Backend** : Node.js with any framework (eg. Express) 

- **Frontend** : Any framework or plain HTML/JS 

- **Database** : Any (SQL or NoSQL) 

- **Authentication** : Custom implementation only, No third-party auth providers (Auth0, Firebase Auth, Cognito, etc.) 

## **System Roles** 

## **1. Super Admin** 

- Uses **static credentials** (hardcoded or config-based) that can: 

- ○ Log in 

   - Create organizations 

   - View list of organizations 

## **2. Organization Admin** 

- Belongs to one organization and can: 

   - Sign up 

   - Log in 

   - Create, update, and delete feature flags for their organization 

## **3. End User** 

● Belongs to one organization and can access a simple form / checkbox to submit and check whether a feature is enabled for their organization 

## **Applications** 

## **1. Super - Admin Frontend** 

Used by **Software Host** 

**Required features** 

- Login 

- Create Organizations 

## **2. Admin Frontend** 

Used by **Organization Admins** . 

## **Required features** 

- Signup 

- Login 

- Feature flag management: 

   - Create a feature flag (e.g., feature_key) 

   - Enable or disable the feature 

- Feature flags are scoped to the admin’s organization 

## **3. User Frontend** 

Used by **End Users** . 

## **Required features** 

- Simple page with: 

   - A checkbox or input for a feature key 

   - A submit button 

- On submission, the system should respond whether: 

   - The feature is **enabled or disabled** for the user’s organization 

## **Data Requirements** 

We’re expecting persistent storage of: 

- Organisations 

- Users 

- Roles 

- Feature flags 

## **Time Guidance** 

This task is expected to take **6–10 hours** . It is **not** expected to be production-ready on submission. We focus more on the clarity, and decision making on the work being submitted rather than treating the code like a Pull Request review. 

