/**
 * @copyright Copyright (c)2021 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('e-champ-durak/bot/StandardSolver');

module.exports = class ThriftySolver extends Base {

    constructor (config) {
        super({
            minStockSizeToSaveAttack: 1,
            minStockSizeToSaveDefense: 6,
            minStockSizeToSaveTransfer: 6,
            ...config
        });
    }

    getCardToTransfer () {
        const card = super.getCardToTransfer();
        if (!card || this.stock < this.minStockSizeToSaveTransfer) {
            return card;
        }
        const currentAverage = this.countAverage(this.cards);
        const pickedAverage = this.countPickedAverage();
        return currentAverage < pickedAverage ? null : card;
    }

    getPairsToDefend () {
        const pairs = super.getPairsToDefend();
        if (!pairs.length
            || this.cards.length === pairs.length
            || this.stock < this.minStockSizeToSaveDefense) {
            return pairs;
        }
        const defendedAverage = this.countDefendedAverage(pairs);
        const pickedAverage = this.countPickedAverage();
        return pickedAverage > defendedAverage ? [] : pairs;
    }

    countDefendedAverage (pairs) {
        let sum = this.countSum(this.cards);
        for (const pair of pairs) {
            sum -= this.countCardValue(pair[1]);
        }
        const counter = this.cards.length - pairs.length;
        return counter ? sum / counter : 0;
    }

    countPickedAverage () {
        let sum = this.countSum(this.cards);
        let counter = this.cards.length;
        for (const [attacking, defending] of this.table) {
            sum += this.countCardValue(attacking);
            if (defending) {
                sum += this.countCardValue(defending);
                counter += 2;
            } else {
                counter += 1;
            }
        }
        return counter ? sum / counter : 0;
    }

    getCardsToNormalAttack (validCards) {
        const cards = this.filterLowestCards(validCards);
        if (this.stock < this.minStockSizeToSaveAttack || !this.table.length || !cards.length) {
            return cards;
        }
        const average = this.countAverage(this.cards);
        const value = this.countCardValue(cards[0]);
        return value <= average ? cards : [];
    }

    countAverage (cards) {
        return cards.length ? this.countSum(cards) / cards.length : 0;
    }

    countSum (cards) {
        let sum = 0;
        for (const card of cards) {
            sum += this.countCardValue(card);
        }
        return sum;
    }

    countCardValue (card) {
        return card.rank + (this.isTrump(card) ? this.options.maxRank : 0);
    }
};