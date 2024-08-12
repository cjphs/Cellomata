class Clause {
    constructor (
      transformState,
      localityCheckType,
      localityCheckState = '',
      localityCount = -1,
      chance = 1,
      localityRangeMin = 0,
      localityRangeMax = 9
    )
  
    {
      // End state of the cell, should this transformation be successful
      this.transformState = transformState
  
      // Mode of the locality check (nearby/always)
      this.localityCheckType = localityCheckType
  
      // State to look for in the locality check
      this.localityCheckState = localityCheckState
  
      // How many cells of the locality check state should be in the neighborhood (-1 = any amount but 0)
      this.localityCount = localityCount
  
      this.localityRangeMin = localityRangeMin
  
      this.localityRangeMax = localityRangeMax
  
      // Chance of the transformation occuring (for probabilistic CA)
      this.chance = chance
  
      // if not null, then this rule must be true with the next rule
      this.conjucted_with = null
  
      this.do_evaluation = true
  
      this.equality_type = '='
    }
  
    conjunctWith = function (transformation) {
      this.conjucted_with = transformation
    }
  
    // True -> Cell being investigated becomes the transformState.
    evaluate = function (neighborhoodDict) {
      if (Math.random() >= this.chance) { return false }
  
      switch (this.localityCheckType) {
        case 'always': {
          return true
        }
        case 'nearby': {
          let n = neighborhoodDict[this.localityCheckState];
  
          return (this.localityRangeMin <= n) && (n <= this.localityRangeMax)
        }
        case 'majority': {
          let mostNeighborsCount = 0
          let mostNeighborsState = ''
  
          states.forEach(s => {
            if (neighborhoodDict[s] > mostNeighborsCount) {
              mostNeighborsCount = neighborhoodDict[s]
              mostNeighborsState = s
            }
          })

          return (mostNeighborsState === this.localityCheckState)
        }
        // directional
        default: {
          if (this.localityCount !== 0) {
            return (neighborhoodDict['*' + this.localityCheckType] === this.localityCheckState)
          } else {
            return (neighborhoodDict['*' + this.localityCheckType] !== this.localityCheckState)
          }
        }
      }
    }
  }

  export default Clause
  