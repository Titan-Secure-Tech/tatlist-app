
export default searchText = (e) => {
  let text = e.toLowerCase()
  let data = this.state.data
  let filteredName = data.filter((item) => {
    return item.name.toLowerCase().match(text)
  })
  if (!text || text === '') {
    this.setState({
      data: initial
    })
  } else if (!Array.isArray(filteredName) && !filteredName.length) {
    // set no data flag to true so as to render flatlist conditionally
    this.setState({
      noData: true
    })
  } else if (Array.isArray(filteredName)) {
    this.setState({
      noData: false,
      data: filteredName
    })
  }
}
