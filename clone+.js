(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must be run unsandboxed');
  }

  class CloneMasterFull {
    constructor() {
      this.cloneStorages = {};
    }

    getInfo() {
      return {
        id: 'clonemasterfull',
        name: 'Clone Master + All Data',
        color1: '#FF6680',
        blocks: [
          {
            opcode: 'createMultipleClones',
            blockType: Scratch.BlockType.COMMAND,
            text: 'create [NUM] clones of [SPRITE]',
            arguments: {
              NUM: { type: Scratch.ArgumentType.NUMBER, defaultValue: 5 },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
            }
          },
          '---',
          {
            opcode: 'setCloneId',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set my clone ID to [ID]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'getSmartId',
            blockType: Scratch.BlockType.REPORTER,
            text: 'next available clone ID'
          },
          {
            opcode: 'getMyId',
            blockType: Scratch.BlockType.REPORTER,
            text: 'my clone ID'
          },
          '---',
          {
            opcode: 'snapToEdge',
            blockType: Scratch.BlockType.COMMAND,
            text: 'go to [EDGE] of clone [ID] from [SPRITE]',
            arguments: {
              EDGE: { type: Scratch.ArgumentType.STRING, menu: 'edges' },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
            }
          },
          {
            opcode: 'getCloneEdge',
            blockType: Scratch.BlockType.REPORTER,
            text: 'clone [ID] of [SPRITE] [EDGE]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' },
              EDGE: { type: Scratch.ArgumentType.STRING, menu: 'edges' }
            }
          },
          '---',
          {
            opcode: 'updateCloneDataIndex',
            blockType: Scratch.BlockType.COMMAND,
            text: 'update [SPRITE] clone [ID] index [INDEX] to [VAL]',
            arguments: {
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              VAL: { type: Scratch.ArgumentType.STRING, defaultValue: '99' }
            }
          },
          {
            opcode: 'getCloneDataIndex',
            blockType: Scratch.BlockType.REPORTER,
            text: 'get [SPRITE] clone [ID] index [INDEX]',
            arguments: {
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' },
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              INDEX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          '---',
          {
            opcode: 'ifCloneIdBlock',
            blockType: Scratch.BlockType.CONDITIONAL,
            text: 'if my clone ID is [ID] then',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'goToClone',
            blockType: Scratch.BlockType.COMMAND,
            text: 'go to clone [ID] of sprite [SPRITE]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
            }
          },
          {
            opcode: 'pointToClone',
            blockType: Scratch.BlockType.COMMAND,
            text: 'point towards clone [ID] of sprite [SPRITE]',
            arguments: {
              ID: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              SPRITE: { type: Scratch.ArgumentType.STRING, defaultValue: 'Sprite1' }
            }
          },
          {
            opcode: 'getLastTouchedId',
            blockType: Scratch.BlockType.REPORTER,
            text: 'last touched clone ID'
          }
        ],
        menus: {
          edges: {
            acceptReporters: true,
            items: ['top', 'bottom', 'left', 'right', 'x position', 'y position']
          }
        }
      };
    }

    _findTarget(id, spriteName) {
      const targetId = Scratch.Cast.toNumber(id);
      const name = Scratch.Cast.toString(spriteName);
      const targets = Scratch.vm.runtime.targets;
      for (const t of targets) {
        if (t.sprite.name === name && t.customCloneId === targetId) return t;
      }
      return null;
    }

    snapToEdge(args, util) {
      const t = this._findTarget(args.ID, args.SPRITE);
      if (!t) return;

      const bounds = t.getBounds() || { top: t.y, bottom: t.y, left: t.x, right: t.x };
      let newX = t.x;
      let newY = t.y;

      switch(args.EDGE.toLowerCase()) {
        case 'top': newY = bounds.top; break;
        case 'bottom': newY = bounds.bottom; break;
        case 'left': newX = bounds.left; break;
        case 'right': newX = bounds.right; break;
      }

      util.target.setXY(newX, newY);
    }

    getCloneEdge(args) {
      const t = this._findTarget(args.ID, args.SPRITE);
      if (!t) return 0;

      const bounds = t.getBounds() || { top: t.y, bottom: t.y, left: t.x, right: t.x };
      switch(args.EDGE.toLowerCase()) {
        case 'top': return bounds.top;
        case 'bottom': return bounds.bottom;
        case 'left': return bounds.left;
        case 'right': return bounds.right;
        case 'x position': return t.x;
        case 'y position': return t.y;
        default: return 0;
      }
    }

    updateCloneDataIndex(args) {
      const key = `${args.SPRITE}-${args.ID}`;
      let parts = (this.cloneStorages[key] || "").split(',');
      const idx = Math.max(0, Math.floor(args.INDEX)-1);
      while (parts.length <= idx) parts.push("0");
      parts[idx] = String(args.VAL);
      this.cloneStorages[key] = parts.join(',');
    }

    getCloneDataIndex(args) {
      const key = `${args.SPRITE}-${args.ID}`;
      const parts = (this.cloneStorages[key] || "").split(',');
      const idx = Math.max(0, Math.floor(args.INDEX)-1);
      return parts[idx] || "";
    }

    setCloneId(args, util) {
      util.target.customCloneId = Scratch.Cast.toNumber(args.ID);
    }

    getMyId(args, util) {
      return util.target.customCloneId || 0;
    }

    getSmartId(args, util) {
      const targets = Scratch.vm.runtime.targets;
      let highest = 0;
      const myName = util.target.sprite.name;
      for (const t of targets) {
        if (t.sprite.name === myName && (t.customCloneId || 0) > highest) {
          highest = t.customCloneId;
        }
      }
      return highest + 1;
    }

    ifCloneIdBlock(args, util) {
      return (util.target.customCloneId || 0) === Scratch.Cast.toNumber(args.ID);
    }

    createMultipleClones(args) {
      const num = Math.max(0, Math.min(300, Math.floor(args.NUM)));
      const target = Scratch.vm.runtime.getSpriteTargetByName(args.SPRITE);
      if (target) {
        for (let i = 0; i < num; i++) {
          const clone = Scratch.vm.runtime.createClone(target);
          clone.customCloneId = this.getSmartId({}); // assign unique ID
        }
      }
    }

    goToClone(args, util) {
      const t = this._findTarget(args.ID, args.SPRITE);
      if (t) util.target.setXY(t.x, t.y);
    }

    pointToClone(args, util) {
      const t = this._findTarget(args.ID, args.SPRITE);
      if (t) {
        const dx = t.x - util.target.x;
        const dy = t.y - util.target.y;
        const direction = 90 - ((180 / Math.PI) * Math.atan2(dy, dx));
        util.target.setDirection(direction);
      }
    }

    getLastTouchedId(args, util) {
      const targets = Scratch.vm.runtime.targets;
      for (const t of targets) {
        if (t === util.target) continue;
        if (util.target.isTouchingTarget(t)) {
          if (typeof t.customCloneId !== 'undefined') return t.customCloneId;
        }
      }
      return 0;
    }
  }

  Scratch.extensions.register(new CloneMasterFull());
})(Scratch);
