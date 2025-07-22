const { generateDigits, generateTarget, isCorrectAnswer } = require('./math-util');
const { evaluate } = require('mathjs');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

class GameManager {
  static games = new Map();

  static async startGame(channel, options) {
    if (GameManager.games.has(channel.id)) return false;

    const game = {
      host: options.host,
      secondsPerRound: options.secondsPerRound,
      pointsToWin: options.pointsToWin,
      numDigits: options.numDigits,
      scores: new Map(),
      currentDigits: [],
      target: null,
      round: 0,
      timeoutHandle: null
    };

    GameManager.games.set(channel.id, game);
    setTimeout(() => GameManager.runRound(channel), 5000);
    return true;
  }

  static stopGame(channel) {
    if (!GameManager.games.has(channel.id)) return false;
    GameManager.games.delete(channel.id);
    return true;
  }


  static runRound(channel) {
    if (!GameManager.games.has(channel.id)) return;
    const game = GameManager.games.get(channel.id);

    game.round++;
    game.currentDigits = generateDigits(game.numDigits);
    game.target = generateTarget(game.numDigits);

    channel.send(`
🔔 **Round ${game.round}**
🎯 Target: \`${game.target}\`
🔢 Digits: \`${game.currentDigits.join(', ')}\`
You have ${game.secondsPerRound} seconds to answer!
    `);

    const filter = msg => {
      if (msg.author.bot) return false;
      return isCorrectAnswer(msg.content, game.currentDigits, game.target);
    };

    const collector = channel.createMessageCollector({ filter, time: game.secondsPerRound * 1000 });

    let roundWon = false;
    collector.on('collect', async msg => {
      if (roundWon) return;
      roundWon = true;
      msg.react('✅');
      collector.stop();

      const userId = msg.author.id;
      game.scores.set(userId, (game.scores.get(userId) || 0) + 1);

      const scoreboard = [...game.scores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id, score]) => `<@${id}>: ${score} point(s)`).join('\n');

      channel.send(`🎉 <@${userId}> got it right!`);
      await delay(2000);
      channel.send(`🏅 **Scoreboard:**\n${scoreboard}`);

      if (game.scores.get(userId) >= game.pointsToWin) {
        channel.send(`🏆 <@${userId}> wins the game!`);
        GameManager.games.delete(channel.id);
      } else {
        setTimeout(() => GameManager.runRound(channel), 4000);
      }
    });

    collector.on('end', collected => {
      if (!roundWon) {
        if (!GameManager.games.has(channel.id)) return;
        channel.send('Time\'s up! No correct answer.');
        setTimeout(() => GameManager.runRound(channel), 4000);
      }
    });
  }
}

module.exports = { GameManager };