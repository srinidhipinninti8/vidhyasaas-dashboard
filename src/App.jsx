// 1. Loading State (Highest Priority)
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', fontSize:'13px' }}>
      Connecting to VidhyaSaaS...
    </div>
  )

  // 2. Main Application Router
  return (
    <BrowserRouter>
      <Routes>
        {/* If no user, show Login */}
        {!user ? (
          <Route path="*" element={<Login onLogin={(u) => {
            console.log("Login triggered for:", u.email);
            setUser(u);
          }} />} />
        ) : (
          /* IF USER EXISTS, WE SHOW THE LAYOUT NO MATTER WHAT */
          /* We provide a fallback 'tenant_demo_school' if schema is missing */
          <Route path="/" element={
            <Layout 
              theme={theme} 
              toggleTheme={toggleTheme} 
              user={user} 
              onLogout={() => db.auth.signOut().then(() => {
                setUser(null);
                setSchema(null);
                window.location.href = '/'; 
              })} 
            />
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard schema={schema || 'tenant_demo_school'} />} />
            <Route path="students" element={<Students schema={schema || 'tenant_demo_school'} />} />
            <Route path="crm" element={<CRM schema={schema || 'tenant_demo_school'} />} />
            <Route path="finance" element={<Finance schema={schema || 'tenant_demo_school'} />} />
            <Route path="staff" element={<Staff schema={schema || 'tenant_demo_school'} />} />
            <Route path="settings" element={<Settings onUpdate={setUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )