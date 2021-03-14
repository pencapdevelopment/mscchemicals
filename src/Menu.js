const Menu = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'fa fa-columns',
        translate: 'sidebar.nav.DASHBOARD'
    },
    {
        name: 'Users',
        path: '/users',
        icon: 'fa fa-users',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Roles',
        path: '/roles',
        icon: 'fa fa-shield-alt',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Cost accounting',
        path: '/cost-accounting',
        icon: 'icon-cloud-upload',
        role: 'ROLE_ADMIN'
    },
    {
        heading: 'Company',
        role: 'ROLE_ADMIN',
       
    },
    {
        name: 'Companies',
        path: '/companies',
        icon: 'fa fa-university',
        role: 'ROLE_ADMIN',
        permission:"MG_CM"
    },
    {
        name: 'Contacts',
        path: '/company-contact',
        icon: 'fa fa-address-book',
        role: 'ROLE_ADMIN',
       
    },
    {
        name: 'Products',
        path: '/products',
        icon: 'fa fa-cubes',
        role: 'ROLE_ADMIN',
        permission:"MG_PD"
    },

    {
        heading: 'Sales & Purchases',
        role: 'ROLE_ADMIN',
        
    },
    {
        name: 'Sales',
        path: '/sales',
        icon: 'fa fa-cloud-upload-alt',
        role: 'ROLE_ADMIN',
        permission:"MG_SE_E,MG_SE_V"
    },
    // {
    //     name: 'Sales1',
    //     path: '/sales1',
    //     icon: 'fa fa-cloud-upload-alt',
    //     role: 'ROLE_ADMIN',
    //     permission:"MG_SE_E,MG_SE_V"
    // },
    {
        name: 'Purchases',
        path: '/purchases',
        icon: 'fa fa-shopping-cart',
        role: 'ROLE_ADMIN',
        permission:"MG_PR_E,MG_PR_V"
    },
    {
        name: 'Orders',
        path: '/orders',
        icon: 'fa fa-clipboard-list',
        role: 'ROLE_ADMIN',
        permission:"MG_OR_E,MG_OR_V_,MG_AC"
    },

    {
        name: 'Invoices',
        path: '/invoices',
        icon: 'icon-docs',
        role: 'ROLE_ADMIN',
        permission:"MG_AC"
    },


    {
        heading: 'Marketing',
        role: 'ROLE_ADMIN'
    },
  
    // {
    //     name: 'Leads',
    //     path: '/leads',
    //     icon: 'fa fa-history',
    //     role: 'ROLE_ADMIN',
    //     permission:"MG_CM"
    // },
    // {
    //     name: 'Prospective Buyers',
    //     path: '/ProspectiveBuyer',
    //     icon: 'fa fa-history',
    //     role: 'ROLE_ADMIN',
    //     permission:"MG_CM"
    // },
    {
       
        name: 'Prospective Buyer',
        icon: 'fas fa-caret-down',
        role: 'ROLE_ADMIN',
        permission:"MG_CM",
        label:{
            color: '#2b3db6',
            icon:'fas fa-caret-down'
        },
        submenu:[
            {
                path:'/ProspectiveBuyer',
                name:'Prospective Buyers',
                icon:'fa fa-history'
            },
            {
                path:'/sales',
                name:'Sales',
                icon:'fa fa-history'
            },
            {
                path:'/Orders',
                name:'Orders',
                icon:'fa fa-history'
            }
        ]
    },
    // {
    //     name: 'Prospective Vendors',
    //     path: '/prospectivevendor',
    //     icon: 'fa fa-history',
    //     role: 'ROLE_ADMIN',
    //     permission:"MG_CM"
    // },
    {
        name: 'Prospective Vendor',
        path: '/prospectivevendor',
        icon: 'fas fa-caret-down',
        role: 'ROLE_ADMIN',
        permission:"MG_CM",
        label:{
            color: '#2b3db6',
            icon:'fas fa-caret-down'
        },
        submenu:[
            {
                path:'/prospectivevendor',
                name:'Prospective Vendors',
                icon:'fa fa-history'
            },
            {
                path:'/purchases',
                name:'Purchases',
                icon:'fa fa-history'
            },
            {
                path:'/Orders',
                name:'Orders',
                icon:'fa fa-history'
            }
        ]
    },
    {
        name: 'Communication History',
        path: '/followups',
        icon: 'fa fa-history',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Sample Tracking',
        path: '/trackings',
        icon: 'fa fa-search-location',
        role: 'ROLE_ADMIN',
        permission:"MG_TR"
    },
    {
        name: 'Groups & Contacts',
        path: '/groups',
        icon: 'fa fa-layer-group',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Bulk SMS',
        path: '/bulk-sms',
        icon: 'fa fa-comments',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Bulk Mail',
        path: '/bulk-mail',
        icon: 'fa fa-mail-bulk',
        role: 'ROLE_ADMIN'
    },

    {
        heading: 'Misc'
    },
    {
        name: 'Calender & Events',
        path: '/events',
        icon: 'fa fa-calendar-alt'
    },
    {
        name: 'Notifications',
        path: '/notifications',
        icon: 'fa fa-bell'
    },
    {
        name: 'Sales Approvals',
        path: '/sales-approval-alerts',
        icon: 'fa fa-bell'
    },
    {
        name: 'Purchases Approvals',
        path: '/purchases-approval-alerts',
        icon: 'fa fa-bell'
    },
    
    {
        name: 'Profile',
        path: '/profile',
        icon: 'fa fa-user'
    },
    {
        name: 'Reports',
        path: '/reports',
        icon: 'fa fa-signal',
        role: 'ROLE_ADMIN'
    },


    // {
    //     name: 'Complaints',
    //     path: '/complaints',
    //     icon: 'icon-note',
    //     role: 'ROLE_ADMIN'
    // },
    // {
    //     name: 'Static Pages',
    //     path: '/pages',
    //     icon: 'icon-layers',
    //     role: 'ROLE_ADMIN'
    // },
    {
        name: 'Feedbacks',
        path: '/feedbacks',
        icon: 'fa fa-copy',
        role: 'ROLE_ADMIN'
    },
    {
        name: 'Subscribers',
        path: '/subscribers',
        icon: 'icon-envelope',
        role: 'ROLE_ADMIN'
    },
];

export default Menu;
