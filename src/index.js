import stats from 'simple-statistics'
import round from 'round-to'
const playtimeHoursGroups = [
  [1, 500],
  [500, 1000],
  [1000, 2000],
  [2000, 4000],
  [4000]
]
const quantiles = [0.995, 0.99, 0.90, 0.80, 0.50, 0.25, 0.10, 0.01]

export default function playerbaseStatistics (playerbase) {
  let statistics = {}
  let graphData = {}

  // Add a statistic & graph for a partial playerbase
  function pushPlayerbaseData (key, partialPlayerbaseValues) {
    statistics[key] = calculateStatistics(partialPlayerbaseValues)
    graphData[key] = calculateGraphData(partialPlayerbaseValues)
  }

  // Always add a key for the whole playerbase
  pushPlayerbaseData('all', playerbase.map(x => x.value))

  // Add a key each per playtime group
  playtimeHoursGroups.map(group => {
    let key = 'playtime' + (group.length === 1 ? group : group.join('to'))

    // Filter the entries that match the playtime group
    let partialPlayerbaseValues = playerbase
      .filter(x => {
        if (x.playtime < group[0] * 60 * 60) {
          return false
        }

        if (group[1] && x.playtime > group[1] * 60 * 60) {
          return false
        }

        return true
      })
      .map(x => x.value)

    // Calculate and push the data
    pushPlayerbaseData(key, partialPlayerbaseValues)
  })

  // All calculations done, let's return!
  return {
    leaderboard: playerbase.reverse().slice(0, 25),
    statistics,
    graphData
  }
}

function calculateStatistics (playerbase) {
  if (playerbase.length === 0) return {}

  // Get the basic statistics
  let statistics = {
    min: stats.minSorted(playerbase),
    max: stats.maxSorted(playerbase),
    mean: round(stats.mean(playerbase), 2),
    median: round(stats.medianSorted(playerbase), 2)
  }

  // Get the value for each quantile
  quantiles.map(quantile => {
    statistics['quantile' + quantile * 100] = round(stats.quantileSorted(playerbase, quantile), 2)
  })

  return statistics
}

function calculateGraphData (playerbase) {
  if (playerbase.length === 0) return []

  // Generate 100 points for the graph, using the quantiles
  let points = []
  for (let i = 0; i < 100; i++) {
    points.push(round(stats.quantileSorted(playerbase, i / 100), 2))
  }

  return points
}
