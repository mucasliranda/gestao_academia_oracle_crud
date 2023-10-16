


export function printTables(arr: any) {
  console.log('\n')

  arr.forEach((each: any) => {
    Object.entries(each).forEach(([key, value]) => {
      // @ts-ignore
      if(typeof(value) === 'object') {
        // @ts-ignore
        value = new Date(value).toLocaleDateString()
      }

      console.log(`${key}: ${value}`)
    })

    console.log('\n--------------------------------\n')

  })
}