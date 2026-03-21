const CAD_EXAM = {
    "response_code": 1,
    "results": [
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following statements is true for the Form Designer? a) To add a field to the form layout, drag the field from the Fields tab to the desired destination on the form. b) To create a new field on a form's table, drag the appropriate data type from the Field Types tab to the form and then configure the new field. c) To remove a field from the form layout, hover over the field to enable the Action buttons, and select the Delete (X) button. d) To add a section to the form layout, drag it from the Field Types tab to the desired destination on the form.",
            "correct_answers": ["a, b, and c"],
            "incorrect_answers": [
                "a, b, c, and d",
                "b, c, and d",
                "a, b, and d"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following are configured in an Email Notification? a) Who will receive the notification. b) What content will be in the notification. c) When to send the notification. d) How to send the notification.",
            "correct_answers": ["a, b and c"],
            "incorrect_answers": [
                "a, b, and d",
                "b, c and d",
                "a, c and d"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "To see what scripts, reports, and other application artifacts will be in a published application:",
            "correct_answers": ["Examine the Application Files Related List in the application to be published"],
            "incorrect_answers": [
                "Enter the name of the Application in the Global search field",
                "Open the list of Update Sets for the instance",
                "Open the artifact records individually to verify the value in the Application field"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which one of the following is NOT a debugging strategy for client-side scripts?",
            "correct_answers": ["gs.log()"],
            "incorrect_answers": [
                "g_form.addInfoMessage()",
                "Field Watcher",
                "jslog()"
            ]
        },
        {
            "type": "boolean",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which Application Access configuration field(s) are NOT available if the Can read configuration field is NOT selected?",
            "correct_answers": ["Can create, Can update, and Can delete"],
            "incorrect_answers": [
                "All access to this table via web services",
                "Can read does not affect the availability of other Application Access fields",
                "Allow configuration"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following is NOT a trigger type in Flow Designer?",
            "correct_answers": ["Outbound Email"],
            "incorrect_answers": [
                "Application",
                "Record",
                "Schedule"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "When creating new application files in a scoped application, cross scope access is turned on by default in which of the following?",
            "correct_answers": ["Table"],
            "incorrect_answers": [
                "REST messages",
                "Script Include",
                "Workflow"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "In an Email Notification, which one of the following is NOT true for the Weight field?",
            "correct_answers": ["A Weight value of zero means that no email should be sent"],
            "incorrect_answers": [
                "Only Notifications with the highest weight for the same record and recipients are sent",
                "The Weight value defaults to zero",
                "A Weight value of zero means the Notification is always sent when the Notification's When to send criteria is met"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following objects does a Display Business Rule NOT have access to?",
            "correct_answers": ["previous"],
            "incorrect_answers": [
                "GlideSystem",
                "g_scratchpad",
                "current"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following features are available to Global applications? (Choose two.)",
            "correct_answers": ["Automated Test Framework","Flow Designer"],
            "incorrect_answers": [
                "Delegated Development",
                "Source Control"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which one of the following is NOT a UI Action type?",
            "correct_answers": ["Form choice"],
            "incorrect_answers": [
                "List choice",
                "Form button",
                "List banner button"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following is NOT supported by Flow Designer?",
            "correct_answers": ["Test a flow with rollback"],
            "incorrect_answers": [
                "Call a subflow from a flow",
                "Use Delegated Developer",
                "Run a flow from a MetricBase Trigger"
            ]
        },
        {
            "type": "multiple",
            "difficulty": "easy",
            "category": "CAD",
            "question": "Which of the following are true for reports in ServiceNow? (Choose three.)",
            "correct_answers": ["Can be scheduled to be run and distributed by email.","Can be run on demand by authorized users.","Can be a graphical representation of data."],
            "incorrect_answers": [
                "Any user can see any report shared with them.",
                "All users can generate reports on any table."
            ]
        },{
                "type": "multiple",
                "category": "CAD",
                "question": "Modules must have a Link type. Which one of the following is a list of Link types?",
                "correct_answers": [
                    "Assessment, List of Records, Separator, Timeline Page"
                ],
                "incorrect_answers": [
                    "List of Records, Separator, Catalog Type, Roles",
                    "List of Records, Content Page, Order, URL (from arguments:)",
                    "Assessment, List of Records, Content Page, Roles"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for a table with the Allow configuration Application Access option selected?",
                "correct_answers": ["Out of scope applications can create Business Rules for the table"],
                "incorrect_answers": [
                    "Only the in scope application's scripts can create Business Rules for the table",
                    "Any user with the application's user role can modify the application's scripts",
                    "Out of scope applications can add new tables to the scoped application"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When working in the Form Designer, configuring the label of a field in a child table changes the label on which table(s)?",
                "correct_answers": [
                    "child table"
                ],
                "incorrect_answers": [
                    "base table",
                    "parent table",
                    "all tables"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true?",
                "correct_answers": [
                    "A UI Policy's Actions execute before the UI Policy's Scripts"
                ],
                "incorrect_answers": [
                    "The execution order for a UI Policy's Scripts and Actions is determined at runtime",
                    "A UI Policy's Scripts execute before the UI Policy's Actions",
                    "A UI Policy's Actions and Scripts execute at the same time"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Here is the Business Rule script template:<imagehere>This type of JavaScript function is known as:",
                "correct_answers": [
                    "Self-invoking"
                ],
                "incorrect_answers": [
                    "Constructor",
                    "Scoped",
                    "Anonymous"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which method call returns true only if the currently logged in user has the catalog_admin role and in no other case?",
                "correct_answers": [
                    "g_user.hasRoleExactly('catalog_admin')"
                ],
                "incorrect_answers": [
                    "g_user.hasRole('catalog_admin')",
                    "g_user.hasRoleOnly('catalog_admin')",
                    "g_user.hasRoleFromList('catalog_admin')"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "There is a basic strategy when creating a Utils Script Include. Identify the step that does not belong.",
                "correct_answers": [
                    "Identify the table"
                ],
                "incorrect_answers": [
                    "Script the function(s)",
                    "Create a class",
                    "Create a prototype object from the new class"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which roles grant access to source control repository operations such as importing applications from source control, or linking an application to source control?(Choose two.)",
                "correct_answers": [
                    "source_control",
                    "admin"
                ],
                "incorrect_answers": [
                    "source_control_admin",
                    "git_admin"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When configuring the content of an Email Notification, which syntax should be used to reference the properties of an event triggering the Notification?",
                "correct_answers": [
                    "event.<property name>"
                ],
                "incorrect_answers": [
                    "current.<property name>",
                    "<property name>.getDisplayValue()",
                    "gs.<property name>"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for a Script Include with a Protection Policy value of Protected?",
                "correct_answers": [
                    "The Protection Policy is applied only if the application is downloaded from the ServiceNow App Store"
                ],
                "incorrect_answers": [
                    "Any user with the protected_edit role can see and edit the Script Include",
                    "The Protection policy option can only be enabled by a user with the admin role",
                    "The Protection Policy is applied only if the glide.app.apply_protection system property value is true"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for GlideUser (g_user) methods?",
                "correct_answers": [
                    "Can be used in Client Scripts, UI Policies, and UI Actions"
                ],
                "incorrect_answers": [
                    "Can be used in Client Scripts and UI Policies only",
                    "Can be used in Business Rules only",
                    "Can be used in Business Rules, and Scripts Includes"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When configuring a module, what does the Override application menu roles configuration option do?",
                "correct_answers": [
                    "Users with the module role but without access to the application menu access the module"
                ],
                "incorrect_answers": [
                    "Self-Service users can access the module even though they do not have roles",
                    "Admin is given access to the module even if Access Controls would ordinarily prevent access",
                    "Users with access to the application menu can see the module even if they don't have the module role"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which platform feature can be used to determine the relationships between field in an Import Set table to field in an existing ServiceNow table?",
                "correct_answers": [
                    "Transform Map"
                ],
                "incorrect_answers": [
                    "Business Service Management Map",
                    "Data Sources",
                    "CI Relationship Builder"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When configuring a REST Message, the Endpoint is:",
                "correct_answers": [
                    "The URI of the data to be accessed, queried, or modified"
                ],
                "incorrect_answers": [
                    "The commands to the REST script to stop execution",
                    "Information about the format of the returned data",
                    "The response from the provider indicating there is no data to send back"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When evaluating Access Controls, ServiceNow searches and evaluates:",
                "correct_answers": [
                    "From the most specific match to the most generic match"
                ],
                "incorrect_answers": [
                    "Only for matches on the current table",
                    "Only for matches on the current field",
                    "From the most generic match to the most specific match"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "In a Business Rule, which one of the following returns true if the currently logged in user has the admin role?",
                "correct_answers": [
                    "gs.hasRole('admin')"
                ],
                "incorrect_answers": [
                    "g_form.hasRoleExactly('admin')",
                    "g_form.hasRole('admin')",
                    "gs.hasRoleExactly('admin')"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "From the list below, identify one reason an application might NOT be a good fit with ServiceNow.The application:",
                "correct_answers": [
                    "Requires ג€as-isג€ use of low-level programming libraries"
                ],
                "incorrect_answers": [
                    "Needs workflow to manage processes",
                    "Requires reporting capabilities",
                    "Uses forms extensively to interact with data"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Identify the incorrect statement about Delegated Development in ServiceNow.",
                "correct_answers": [
                    "Administrators can grant non-admin users the ability to develop global applications."
                ],
                "incorrect_answers": [
                    "Administrators can specify which application file types the developer can access.",
                    "Administrators can grant the developer access to script fields.",
                    "Administrators can grant the developer access to security records."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "One of the uses of the ServiceNow REST API Explorer is:",
                "correct_answers": [
                    "Create sample code for sending REST requests to ServiceNow"
                ],
                "incorrect_answers": [
                    "Practice using REST to interact with public data providers",
                    "Find resources on the web for learning about REST",
                    "Convert SOAP Message functions to REST methods"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true regarding Application Scope?",
                "correct_answers": [
                    "Applications downloaded from 3 party ServiceNow application developers cannot have naming conflicts rd"
                ],
                "incorrect_answers": [
                    "All applications are automatically part of the Global scope",
                    "Any developer can edit any application",
                    "Developers can choose the prefix for a scope's namespace"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is the baseline behavior of a table in a privately-scoped application?",
                "correct_answers": [
                    "All application scopes can read from the table"
                ],
                "incorrect_answers": [
                    "The table and its data are not accessible using web services",
                    "Any Business Rule can read, write, delete, and update from the table",
                    "Only artifacts in the table's application can read from the table"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT a purpose of application scoping?",
                "correct_answers": [
                    "Provide a way of tracking the user who developed an application"
                ],
                "incorrect_answers": [
                    "Provide a relationship between application artifacts",
                    "Provide a namespace (prefix and scope name) to prevent cross application name collisions",
                    "Provide controls for how scripts from another scope can alter tables in a scoped application"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "It is best practice to define the business requirements and the process(es) an application will manage as part of the application development plan. What are some of the considerations to document as part of the business process?",
                "correct_answers": [
                    "Business problem, data input/output, users/stakeholders, and process steps"
                ],
                "incorrect_answers": [
                    "Business problem, data input/output, project schedule, and process steps",
                    "Business problem, data input/output, users/stakeholders, and database capacity",
                    "Business problem, users/stakeholders, available licenses, and database capacity"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following statements does NOT apply when extending an existing table?",
                "correct_answers": [
                    "You must script and configure all required behaviors"
                ],
                "incorrect_answers": [
                    "The parent table's Access Controls are evaluated when determining access to the new table's records and fields",
                    "The new table inherits the functionality built into the parent table",
                    "The new table inherits all of the fields from the parent table"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following CANNOT be debugged using the Field Watcher?",
                "correct_answers": [
                    "Script Includes"
                ],
                "incorrect_answers": [
                    "Business Rules",
                    "Client Scripts",
                    "Access Controls"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which objects can be used in Inbound Action scripts?",
                "correct_answers": [
                    "current and email"
                ],
                "incorrect_answers": [
                    "current and previous",
                    "current and event",
                    "current and producer"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is part of the client-side scripting API?",
                "correct_answers": [
                    "GlideUser object (g_user)"
                ],
                "incorrect_answers": [
                    "workflow.scratchpad",
                    "current and previous objects",
                    "GlideSystem object (gs)"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Application developers configure ServiceNow using industry standard JavaScript to ¦",
                "correct_answers": [
                    "Extend and add functionality"
                ],
                "incorrect_answers": [
                    "Enable the right-click to edit the context menus on applications in the navigator",
                    "Customize the organization's company logo and banner text",
                    "Configure the outgoing email display name"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "How many applications menus can an application have?",
                "correct_answers": [
                    "As many as the application design requires"
                ],
                "incorrect_answers": [
                    "3, one for an application's user modules, one for an application's administrator modules, and one for the ServiceNow administrator's modules",
                    "2, one for an application's user modules and one for an application's administrator modules",
                    "1, which is used for all application modules"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "The source control operation used to store local changes on an instance for later application is called a(n) <blank>.",
                "correct_answers": [
                    "Stash"
                ],
                "incorrect_answers": [
                    "Branch",
                    "Tag",
                    "Update set"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What syntax is used in a Record Producer script to access values from Record Producer form fields?",
                "correct_answers": [
                    "producer.field_name"
                ],
                "incorrect_answers": [
                    "producer.variablename",
                    "current.variable_name",
                    "current.field_name"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following methods prints a message on a blue background to the top of the current form by default?",
                "correct_answers": [
                    "g_form.addInfoMessage()"
                ],
                "incorrect_answers": [
                    "g_form.addInfoMsg()",
                    "g_form.showFieldMessage()",
                    "g_form.showFieldMsg()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "A scoped application containing Flow Designer content dedicated to a particular application is called a(n):",
                "correct_answers": [
                    "Spoke"
                ],
                "incorrect_answers": [
                    "Bundle",
                    "Action",
                    "Flow"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is a Module?",
                "correct_answers": [
                    "The functionality within an application menu such as opening a page in the content frame or a separate tab or window"
                ],
                "incorrect_answers": [
                    "A group of menus, or pages, providing related information and functionality to end-users",
                    "A way of helping users quickly access information and services by filtering the items in the Application Navigator",
                    "A web-based way of providing software to end-users"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which source control operation is available from BOTH Studio and the Git Repository?",
                "correct_answers": [
                    "Create Branch"
                ],
                "incorrect_answers": [
                    "Apply Remote Changes",
                    "Stash Local Changes",
                    "Edit Repository Configurations"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT required to link a ServiceNow application to a Git repository?",
                "correct_answers": ["Application name"],
                "incorrect_answers": [
                    "Password",
                    "URL",
                    "User name"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which Report Type(s) can be created by right-clicking on a column header in a table's list?",
                "correct_answers": [
                    "Bar Chart and Pie Chart"
                ],
                "incorrect_answers": [
                    "Bar Chart, Pie Chart, Histogram, and Line",
                    "Bar Chart",
                    "Bar Chart, Pie Chart, and Histogram"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT a method used for logging messages in a server-side script for a privately-scoped application?",
                "correct_answers": ["gs.log()"],
                "incorrect_answers": [
                    "gs.error()",
                    "gs.warn()",
                    "gs.debug()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "If the Create module field is selected when creating a table, what is the new module's default behavior?",
                "correct_answers": ["Display a list of all records from the table"],
                "incorrect_answers": [
                    "Open an empty form so new records can be created",
                    "Open a link to a wiki article with instructions on how to customize the behavior of the new module",
                    "Display an empty homepage for the application"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "How must Application Access be configured to prevent all other private application scopes from creating configuration records on an application's data tables?",
                "correct_answers": [
                    "Set the Accessible from field value to This application scope only"
                ],
                "incorrect_answers": [
                    "You must create Access Controls to prevent all other application scopes from creating configuration records on an application's data tables rather than using Application Access",
                    "Set the Accessible from field value to All application scopes and de-select the Can create option",
                    "Set the Accessible from field value to This application scope only and de-select the Allow access to this table via web services option"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are some of the benefits of extending an existing table such as the Task table when creating a new application? a) You can repurpose existing fields by simply changing the label. b) Use existing fields with no modifications. c) Existing logic from the parent table will be automatically applied to the new table. d) All of the parent table records are copied to the new table.",
                "correct_answers": [
                    "a, b, and c"
                ],
                "incorrect_answers": [
                    "a, b, c, and d",
                    "a and b",
                    "b and c"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When configuring an Access Control which has no condition or script, which one of the following statements is NOT true?",
                "correct_answers": [
                    "table.id will grant access to a specific record on the table"
                ],
                "incorrect_answers": [
                    "table.*will grant access to every field in a record",
                    "table.None will grant access to every record on the table",
                    "table.field will grant access to a specific field in a record"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following methods are useful in Access Control scripts?",
                "correct_answers": ["gs.hasRole() and current.isNewRecord()"],
                "incorrect_answers": [
                    "g_user.hasRole() and current.isNewRecord()",
                    "g_user.hasRole() and current.isNew()",
                    "gs.hasRole() and current.isNew()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following client-side scripts apply to Record Producers?",
                "correct_answers": ["Catalog Client Scripts and Catalog UI Policies"],
                "incorrect_answers": [
                    "UI Scripts and UI Actions",
                    "UI Scripts and Record Producer Scripts",
                    "Client Scripts and UI Policies"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When a ServiceNow instance requests information from a web service, ServiceNow is the web service:",
                "correct_answers": ["Consumer"],
                "incorrect_answers": [
                    "Publisher",
                    "Specialist",
                    "Provider"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is the fastest way to create and configure a Record Producer?",
                "correct_answers": [
                    "Open the table in the Table records and select the Add to Service Catalog Related Link"
                ],
                "incorrect_answers": [
                    "Create a Catalog Category, open the category, and select the Add New Record Producer button",
                    "Use the Record Producer module then add and configure all variables manually",
                    "Open the table's form, right-click on the form header, and select the Create Record Producer menu item"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which objects can you use in a Scheduled Script Execution (Scheduled Job) script?",
                "correct_answers": [
                    "GlideSystem and GlideRecord"
                ],
                "incorrect_answers": [
                    "GlideRecord and current",
                    "GlideUser and GlideRecord",
                    "GlideSystem and current"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Can inherited fields be deleted from a table?",
                "correct_answers": [
                    "No, inherited fields cannot be deleted from a child table"
                ],
                "incorrect_answers": [
                    "Yes, select the red X in the left-most column in the table definition",
                    "Yes, but only if they are text fields",
                    "Yes, but only if there has never been any saved field data"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is the purpose of the Application Picker?",
                "correct_answers": [
                    "Choose an application to edit and set the Application Scope"
                ],
                "incorrect_answers": [
                    "Select an application to run",
                    "Select an application as a favorite in the Application Navigator",
                    "Choose an application to download and install"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are Application Files in a ServiceNow application?",
                "correct_answers": [
                    "ServiceNow artifacts comprising an application"
                ],
                "incorrect_answers": [
                    "An XML export of an application's table records",
                    "CSV files containing data imported into an application",
                    "XML exports of an application's Update Set"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT true for Modules?",
                "correct_answers": ["Every Module must be associated with a table"],
                "incorrect_answers": [
                    "Modules open content pages",
                    "Access to Modules is controlled with roles",
                    "Every Module must be part of an Application Menu"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "A graphical view of relationships among tables is a <blank>.",
                "correct_answers": ["Schema map"],
                "incorrect_answers": [
                    "Dependency view",
                    "Graphical User Interface",
                    "Map source report"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for the Application Picker?",
                "correct_answers": ["All custom application scope and the Global scope appear in the Application Picker"],
                "incorrect_answers": [
                    "All applications in ServiceNow, including baseline applications like Incident, appear in the Application Picker",
                    "Only custom applications appear in the Application Picker",
                    "Only downloaded applications appear in the Application Picker"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When creating an application through the Guided Application Creator, which of the following is a user experience option?",
                "correct_answers": [
                    "Mobile"
                ],
                "incorrect_answers": [
                    "Portal",
                    "Self-service",
                    "Workspace"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When writing a Client Script to provide feedback targeted at a specific field, which method should be used?",
                "correct_answers": ["g_form.showFieldMsg()"],
                "incorrect_answers": [
                    "g_form.showInfoMessage()",
                    "g_form.addInfoMessage()",
                    "g_form.addFieldMsg()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which actions can a Business Rule take without scripting?",
                "correct_answers": ["Set field values and add message"],
                "incorrect_answers": [
                    "Set field values and write to the system log",
                    "Set field values and generate an event",
                    "Set field values and query the database"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which server-side object provides methods for working with dates when writing a script in a privately scoped application?",
                "correct_answers": ["GlideDateTime"],
                "incorrect_answers": [
                    "GlideRecord",
                    "GlideSystem",
                    "current"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Application developers can specify which ServiceNow page a user sees after submitting a new record using the Record Producer UI. How is the page specified?",
                "correct_answers": ["Write a script in the Record Producer's Script field: producer.redirect = \"<URL>\";"],
                "incorrect_answers": [
                    "Create an application property to store the URL",
                    "Configure the page in the Module that opens the Record Producer UI",
                    "Write an after Business Rule script for the Record Producer's table: window.redirect = \"<URL>\";"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Identify characteristic(s) of a Record Producer. (Choose three.)",
                "correct_answers": [
                    "Each field prompts the user with a question rather than a field label.",
                    "You can script behaviors of fields in the user interface.",
                    "Graphics can be included on the user interface."
                ],
                "incorrect_answers": [
                    "All records created using this strategy are inserted into the Requested Item [sc_req_item] table.",
                    "They must be scripted."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which server-side API debug log method is available for scoped applications?",
                "correct_answers": ["gs.info()"],
                "incorrect_answers": [
                    "gs.log()",
                    "gs.debuglog()",
                    "gs.print()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which script types execute on the server? (Choose three.)",
                "correct_answers": [
                    "Business Rule",
                    "Script Actions",
                    "Scheduled Jobs"
                ],
                "incorrect_answers": [
                    "Client Scripts",
                    "UI Policies"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is the best UX format to use for lists and forms?",
                "correct_answers": [
                    "Classic"
                ],
                "incorrect_answers": [
                    "Forms",
                    "Lists",
                    "Standard"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When creating a table in a privately-scoped application, which four Access Controls are created for the table?",
                "correct_answers": [
                    "Create, Delete, Read, Write"
                ],
                "incorrect_answers": [
                    "Insert, Delete, Query, Write",
                    "Create, Delete, Read, Update",
                    "Insert, Delete, Query, Update"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for this script fragment?g_user.hasRole('x_my_app_user');",
                "correct_answers": ["The method returns true if the currently logged in user has the x_my_app_user role or the admin role"],
                "incorrect_answers": [
                    "There is no g_user.hasRole() method",
                    "The method returns false only if the currently logged in user has the x_my_app_user role",
                    "The method returns true only if the currently logged in user has the x_my_app_user role"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following database operations cannot be controlled with Application Access?",
                "correct_answers": ["Query"],
                "incorrect_answers": [
                    "Update",
                    "Create",
                    "Delete"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "For Application Access there is a configuration option called Allow access to this table via web services. Which one of the following statements is true when this option is selected?",
                "correct_answers": [
                    "The user performing the query via web services must have the correct permissions to access the table's records"
                ],
                "incorrect_answers": [
                    "This option restricts the ability to delete records via web services but records can always be read",
                    "Even when not selected, users with the correct permissions can use web services to access the table's records",
                    "This option restricts access only to SOAP web services but does not apply to REST"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following statements must evaluate to true for a user to pass an Access Control? (Choose three.)",
                "correct_answers": [
                    "The user has one of the roles specified in the Required roles related list.",
                    "Scripts configured in the Access Control must evaluate to true.",
                    "Conditions configured in the Access Control must evaluate to true."
                ],
                "incorrect_answers": [
                    "Other matching Access Controls for the records evaluate to true.",
                    "The user must be granted access through a business rule."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is a workflow context?",
                "correct_answers": ["It is generated from a workflow version, executes activities, and follows transitions"],
                "incorrect_answers": [
                    "The table for which a workflow is defined plus any conditions such as \"Active is true\"",
                    "The business reason or process for which a workflow is designed",
                    "It is a checked out workflow which is being edited"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is a benefit of creating an Application Properties page for each application you develop?",
                "correct_answers": ["Application Properties allow a developer or admin to make changes to an application's behavior without modifying application artifacts"],
                "incorrect_answers": [
                    "Application Properties allow a developer to override the application properties inherited from ServiceNow",
                    "An Application Properties page is a good landing page for an application",
                    "Application users know to go to the Application Properties page to change the appearance of an application"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT an example of when an application might use a Scheduled Script Execution (Scheduled Job)?",
                "correct_answers": [
                    "The application needs to run a client-side script at the same time every day"
                ],
                "incorrect_answers": [
                    "The application needs to send weekly email reminders to requestors for all records on a table",
                    "The application needs to run a clean up script on the last day of every month",
                    "The application needs to query the database every day to look for unassigned records"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following objects CANNOT be used in a Script Action script?",
                "correct_answers": [
                    "previous"
                ],
                "incorrect_answers": [
                    "GlideRecord",
                    "event",
                    "current"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "How does ServiceNow match inbound email to existing records?",
                "correct_answers": [
                    "Watermark"
                ],
                "incorrect_answers": [
                    "Record link",
                    "Subject line",
                    "sys_id"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When debugging Email Notifications, what must you check on a user record? (Choose three.)",
                "correct_answers": [
                    "Active must be true.",
                    "The value in the Notification field must be set to enabled.",
                    "The Email field must have a value."
                ],
                "incorrect_answers": [
                    "The First name and Last name fields must have values.",
                    "The user must not be locked out."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are web services?",
                "correct_answers": ["Methods used to allow applications to connect to other software applications over a network"],
                "incorrect_answers": [
                    "Methods used to create and maintain UI Pages",
                    "Methods used to discover a wide variety of systems and applications",
                    "They provide a customer-facing view of available service and product offerings provided by departments within the organization"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following methods is NOT part of the ServiceNow REST API?",
                "correct_answers": ["COPY"],
                "incorrect_answers": [
                    "GET",
                    "DELETE",
                    "POST"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "You are developing the MyApp application that has a table, Table A. When the MyApp application is installed on an instance, you want Table A's records to be installed as part of the application.Table A's records will be installed when:",
                "correct_answers": [
                    "Table A's records are added to the application record using the Create Application Files context menu item"
                ],
                "incorrect_answers": [
                    "Table A is active and extends the Task table",
                    "Table A has an automatic number counter for new records",
                    "Table A is not included in the System Clone > Exclude Tables list"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "How can an application link to a repository behind a firewall?",
                "correct_answers": ["Link an application to source control through a MID Server."],
                "incorrect_answers": [
                    "This option is not supported.",
                    "Link an application to source control through an access token.",
                    "Link an application to source control with multi-factor authentication."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is the ServiceNow store?",
                "correct_answers": ["Marketplace for free and paid certified ServiceNow applications and integrations"],
                "incorrect_answers": [
                    "Downloadable content ServiceNow script archive",
                    "Alternate name for the ServiceNow Developer Share site",
                    "The source for ServiceNow Community created developer content"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Tables that extend a table do what?",
                "correct_answers": ["Inherit the parent’s fields"],
                "incorrect_answers": [
                    "Automatically update the application scope",
                    "Do not inherit the parent’s fields",
                    "Sometimes inherit the parent’s fields"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When creating an application through the Guided Application Creator, which of the following is NOT an option for creating a table?",
                "correct_answers": [
                    "Create table from template"
                ],
                "incorrect_answers": [
                    "Create table from scratch",
                    "Extend a table",
                    "Upload spreadsheet"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Server-side scripts manage what?",
                "correct_answers": [
                    "Database and backend"
                ],
                "incorrect_answers": [
                    "Playbook access",
                    "User access",
                    "Forms and Fields"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What intuitive development interface guides users through the initial application development process?",
                "correct_answers": ["Guided Application Creator"],
                "incorrect_answers": [
                    "Guided Tour Designer",
                    "ServiceNow Studio",
                    "Flow Designer"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are some benefits of developing private, scoped applications? (Choose two.)",
                "correct_answers": ["To reduce risk at code collisions",
                "To enable installation and uninstallation of an application"],
                "incorrect_answers": [
                    "To avoid using a code repository like GitHub or GitLab",
                    "To replicate ServiceNow functions a private scope"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following statements is NOT true for the Form Designer?",
                "correct_answers": [
                    "To add a section to the form layout, drag it from the Field Types tab to the desired destination on the form."
                ],
                "incorrect_answers": [
                    "To add a field to the form layout, drag the field from the Fields tab to the desired destination on the form.",
                    "To remove a field from the form layout, hover over the field to enable the Action buttons, and select the Delete (X) button.",
                    "To create a new field on a form’s table, drag the appropriate data type from the Field Types tab to the form and then configure the new field."
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What records are used to track cross-scope applications or scripts that request access to an application, application resource, or event?",
                "correct_answers": [
                    "Restricted caller access records"
                ],
                "incorrect_answers": [
                    "Caller tracking records",
                    "Access control level records",
                    "Cross-scope access records"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which ATF Test step allows you to create a user with speeded roles and groups for the test?",
                "correct_answers": ["Create a user"],
                "incorrect_answers": [
                    "Create a group",
                    "Impersonation",
                    "Create a role"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What plugin enables the Guided Application Creator?",
                "correct_answers": [
                    "com.glide.sn-guided-app-creator"
                ],
                "incorrect_answers": [
                    "com.glide.service_creator",
                    "com.glide.snc.apps_creator",
                    "com.snc.apps_creator_template"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following can be an external data source for a ServiceNow application?",
                "correct_answers": ["All of the above"],
                "incorrect_answers": [
                    "Microsoft Excel File",
                    "Data provided by a public web service using SOAP or REST",
                    "CSV file"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is true for the Application Picker and Application Scope?",
                "correct_answers": [
                    "Selecting an application from the Application Picker sets the Application Scope"
                ],
                "incorrect_answers": [
                    "Global is a reserved application which does not appear in the Application Picker",
                    "Selecting an application from the Application Picker does not set the Application Scope",
                    "Selecting Global in the Application Picker sets the Application Scope to Incident"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following is an available feature in Studio? (Choose two.)",
                "correct_answers": [
                    "Search code",
                    "Push to external source control"
                ],
                "incorrect_answers": [
                    "Push to update set",
                    "Merge branches"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "The Task table is an example of which of the following? (Choose two.)",
                "correct_answers": [
                    "Parent class",
                    "Base class"
                ],
                "incorrect_answers": [
                    "Legacy class",
                    "Child class"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following is true about deleting fields from a table?",
                "correct_answers": ["User-defined non-inherited fields can be deleted"],
                "incorrect_answers": [
                    "Table records are deleted when a field is deleted",
                    "Any field on a table can be deleted",
                    "Inherited fields can be deleted"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Why would you build a custom app? (Choose two.)",
                "correct_answers": ["To fulfill a specific use case on internal processes",
                "To create a custom integration for a 3rd party system"],
                "incorrect_answers": [
                    "To avoid using a code repository like GitHub or GitLab",
                    "To replace ServiceNow base tables"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are three ServiceNow table creation methods? (Choose three.)",
                "correct_answers": [
                    "Upload and turn a spreadsheet into a custom table",
                    "Extend a table",
                    "Create a custom table"
                ],
                "incorrect_answers": [
                    "Using legacy Workflows",
                    "Using Flow Designer",
                    "Use the Now Experience Table Creator"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When selecting a data type for a field that will be displayed on a form, which of the following statements is NOT correct?",
                "correct_answers": [
                    "Use the Date data type to enter the date and time of day"
                ],
                "incorrect_answers": [
                    "Use the String data type tor a free-form text field",
                    "Use the Phone Number data type to automate phone number data validation",
                    "Use the Choice data type to limit options in a field"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is NOT part of the Form Designer?",
                "correct_answers": ["Schema map"],
                "incorrect_answers": [
                    "Page header",
                    "Field navigator",
                    "Form layout"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which class is NOT part of the Client side scoped APIs?",
                "correct_answers": ["GlideRecord"],
                "incorrect_answers": [
                    "GlideDialogWindow",
                    "GlideAjax",
                    "GlideForm"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When designing and creating a form what do you create to organize fields on a form?",
                "correct_answers": ["Sections"],
                "incorrect_answers": [
                    "Buttons",
                    "Tabs",
                    "Related lists"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which one of the following is a good practice for adding instructions to a form?",
                "correct_answers": [
                    "Annotations"
                ],
                "incorrect_answers": [
                    "Related links to wiki pages",
                    "A Context Menu UI Action",
                    "A populated read-only field"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following GlideRecord methods run a query against a database table? (Choose three.)",
                "correct_answers": ["query()",
                "_query()",
                "get()"],
                "incorrect_answers": [
                    "_get()",
                    "runQuery()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is the GlideForm Client-side scripting object?",
                "correct_answers": ["g_form"],
                "incorrect_answers": [
                    "sn.form",
                    "gs.form",
                    "gs_form"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "In a Business Rule, which one of the following returns the sys_id of the currently logged in user?",
                "correct_answers": [
                    "gs.getUserID()"
                ],
                "incorrect_answers": [
                    "g_form.getUserID()",
                    "gs.getUserSysID()",
                    "g_form.getUserSysID()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Access Control debug information identifies whether each element of an Access Control granted or denied access. The elements appear in the debug information in the order of evaluation. In which order are the elements of an Access Control evaluated?",
                "correct_answers": [
                    "Roles, Conditions, Script"
                ],
                "incorrect_answers": [
                    "Conditions, Roles, Script",
                    "Conditions, Script, Roles",
                    "Script, Conditions, Roles"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Assume a table called table exists and contains 3 fields: field1, field2, field3. Examine the Access Control list for table:<There is image here>1. table.None read Access Control for users with the admin and itil roles. 2. table.* read Access Control for users with the admin role. 3. table.field3 read Access Control for users with the itil role. Which field or fields can a user with the itil role read? ",
                "correct_answers": ["field3 only"],
                "incorrect_answers": [
                    "All fields except field3",
                    "field1, field2, and field3",
                    "field1 and field3",
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Assume a table called table exists and contains 3 fields: field1, field2, field3. Examine the Access Control list for table:<There is image here>1. table.None read Access Control for users with the admin and itil roles. 2. table.field3 read Access Control for users with the itil role. Which field or fields can a user with the itil role read?",
                "correct_answers": [
                    "All fields except field3"
                ],
                "incorrect_answers": [
                    "field3 only",
                    "filed1 and field3",
                    "All fields"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following is NOT a caller access field option?",
                "correct_answers": [
                    "Caller Permission"
                ],
                "incorrect_answers": [
                    "Caller Tracking",
                    "Caller Restriction",
                    "None"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which method is used to retrieve Application Property values in a script?",
                "correct_answers": [
                    "gs.getProperty()"
                ],
                "incorrect_answers": [
                    "g_form.getAppProperty()",
                    "g_form.getProperty()",
                    "gs.getAppProperty()"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What Module Link type is used to access an Application Properties page?",
                "correct_answers": ["URL (from Arguments)"],
                "incorrect_answers": [
                    "Single Record",
                    "HTML (from Arguments)",
                    "Script (from Arguments)"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Identify the way(s) an application can respond to an Event generated by the gs.eventQueue() method.a. Script Actionb. Scheduled Script Execution (Scheduled Job)c. UI Policyd. Email Notification",
                "correct_answers": [
                    "a and d"
                ],
                "incorrect_answers": [
                    "b and c",
                    "c",
                    "a and c"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "When troubleshooting and debugging notifications, where do you navigate to see if an email was sent m response to an event?",
                "correct_answers": ["System Logs > Emails"],
                "incorrect_answers": [
                    "System Logs > Events",
                    "System Logs > Push Notifications",
                    "System Logs > ICE Logs"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What are the benefits of storing the majority of an Application’s server-side script logic in a Script Include?a. This makes execution faster.b. Only run when called from a script.c. The script logic can be hidden when the Application is installed from the ServiceNow Store. d. For some changes to application logic there is only one place to make edits.",
                "correct_answers": [
                    "b, c, and d"
                ],
                "incorrect_answers": [
                    "a, b, and d",
                    "a, b, c, and d",
                    "a, b, and c"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following is NOT a Flow Designer feature?",
                "correct_answers": [
                    "Call a flow from another flow or subflow"
                ],
                "incorrect_answers": [
                    "Run a flow from a Catalog item",
                    "Add stages to a flow",
                    "Test a flow using the “Run as” feature"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "What is the purpose of the coalesce field when importing data?",
                "correct_answers": ["To determine if a record matches an existing record or is a new record"],
                "incorrect_answers": [
                    "If a match is not found, the existing record is updated",
                    "To identify and merge duplicate records",
                    "When a match is found, a new record is inserted"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "If you create a SOAP Message what syntax indicates a variable to pass when the function is called?",
                "correct_answers": ["variable_name"],
                "incorrect_answers": [
                    "current.variable_name",
                    "< variable_name >.do?WSDL",
                    "< variable_name >"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Which of the following is NOT a way to install an application on a ServiceNow instance?",
                "correct_answers": [
                    "Select the Copy button on the application record"
                ],
                "incorrect_answers": [
                    "Install an application from the Application Repository",
                    "Download and install an application from the ServiceNow Share web site",
                    "Download and install a third-party application from the ServiceNow Store"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Using Custom UI test step in Automated Test Framework, which of the following is NOT a testable page component?",
                "correct_answers": ["Form field values"],
                "incorrect_answers": [
                    "Buttons",
                    "UI controls",
                    "UI pages"
                ]
            },
            {
                "type": "multiple",
                "category": "CAD",
                "question": "Flow Designer supports variable data types to store record data and complex data. Which of the following are supported variable data types? (Choose three.)",
                "correct_answers": [
                    "Choice data type",
                    "Integer data type",
                    "Array.Boolean data type"
                ],
                "incorrect_answers": [
                    "Array.Reference data type",
                    "Freedom data type",
                    "Label data type"
                ]
            }
        
    ]
}

export default CAD_EXAM;