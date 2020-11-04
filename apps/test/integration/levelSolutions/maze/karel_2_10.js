import {TestResults} from '@cdo/apps/constants';

module.exports = {
  app: 'maze',
  levelFile: 'karelLevels',
  levelId: '2_10',
  tests: [
    {
      description: 'For loop with no check for hole',
      expected: {
        result: true,
        testResult: TestResults.ALL_PASS
      },
      timeout: 24000,
      missingBlocks: [],
      xml:
        '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">4</title><statement name="DO"><block type="karel_if"><title name="DIR">pilePresent</title><statement name="DO"><block type="procedures_callnoreturn"><mutation name="remove stack of 4 piles"></mutation><next><block type="maze_moveForward"></block></next></block></statement><next><block type="procedures_callnoreturn"><mutation name="fill stack of 2 holes"></mutation><next><block type="maze_moveForward"></block></next></block></next></block></statement></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove stack of 4 piles</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_dig" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill stack of 2 holes</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
    },
    {
      description: 'For loop with if/else',
      expected: {
        result: true,
        testResult: TestResults.BETTER_THAN_IDEAL
      },
      timeout: 24000,
      missingBlocks: [],
      xml:
        '<xml><block type="when_run"><next><block type="controls_repeat"><title name="TIMES">7</title><statement name="DO"><block type="karel_ifElse"><title name="DIR">pilePresent</title><statement name="DO"><block type="procedures_callnoreturn"><mutation name="remove stack of 4 piles"></mutation></block></statement><statement name="ELSE"><block type="procedures_callnoreturn"><mutation name="fill stack of 2 holes"></mutation></block></statement><next><block type="maze_moveForward"></block></next></block></statement></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove stack of 4 piles</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_dig" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill stack of 2 holes</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
    },
    {
      description: 'Single move forward fails',
      expected: {
        result: false
      },
      xml:
        '<xml><block type="when_run"><next><block type="maze_moveForward"></block></next></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">remove stack of 4 piles</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_dig" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">4</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block><block type="procedures_defnoreturn" deletable="false" editable="false"><mutation></mutation><title name="NAME">fill stack of 2 holes</title><statement name="STACK"><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_fill" deletable="false" editable="false"><next><block type="maze_moveForward" deletable="false" editable="false"></block></next></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnRight</title><next><block type="controls_repeat" deletable="false" editable="false"><title name="TIMES">2</title><statement name="DO"><block type="maze_moveForward" deletable="false" editable="false"></block></statement><next><block type="maze_turn" deletable="false" editable="false"><title name="DIR">turnLeft</title></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
    }
  ]
};
