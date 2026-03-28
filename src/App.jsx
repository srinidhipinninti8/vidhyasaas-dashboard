useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      const { data } = await db.auth.getSession()
      const sessionUser = data.session?.user || null
      
      // 👇 ADD THIS LOG
      console.log("DEBUG: Initial User Check ->", sessionUser);

      setUser(sessionUser)
      
      if (sessionUser) {
        const s = await getUserSchema()
        
        // 👇 ADD THIS LOG
        console.log("DEBUG: Initial Schema Check ->", s);
        
        setSchema(s)
      }
      setLoading(false)
    }

    initAuth()

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      const sessionUser = session?.user || null
      
      // 👇 ADD THIS LOG
      console.log("DEBUG: Auth State Changed. Event:", _event, "User:", sessionUser);

      setUser(sessionUser)
      
      if (sessionUser) {
        const s = await getUserSchema()
        
        // 👇 ADD THIS LOG
        console.log("DEBUG: New Schema after change ->", s);
        
        setSchema(s)
      } else {
        setSchema(null)
      }
      setLoading(false)
    })

    return () => {
      if (listener?.subscription) listener.subscription.unsubscribe()
    }
  }, [])