FROM registry.heroiclabs.com/heroiclabs/nakama:3.16.0

COPY dist/*.js /nakama/data/modules/stellaris/
COPY local.yml .