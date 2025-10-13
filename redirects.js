const redirects = async () => {
  // --- Canonical redirect: apex → www ---
  const apexToWwwRedirect = {
    source: '/:path*',
    has: [{ type: 'host', value: 'eutopias.co' }],
    destination: 'https://www.eutopias.co/:path*',
    permanent: true,
  }

  // --- IE redirect (your existing one) ---
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all IE browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // order matters: IE first, then canonical
  return [internetExplorerRedirect, apexToWwwRedirect]
}

export default redirects
