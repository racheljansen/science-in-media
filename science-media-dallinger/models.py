from dallinger.nodes import Source
import random

from sqlalchemy import Integer, String, Float
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast

class WarOfTheGhostsSource(Source):
    """A Source that reads in a random story from a file and transmits it."""

    __mapper_args__ = {
        "polymorphic_identity": "war_of_the_ghosts_source"
    }

    def __init__(self, network, story_num, participant=None):
        super(Source, self).__init__(network, participant)
        self.story_num = story_num

    @hybrid_property
    def story_num(self):
        """Convert property3 to story_num."""
        return int(self.property3)

    @story_num.setter
    def story_num(self, story_num):
        """Make story_num settable."""
        self.property3 = story_num

    @story_num.expression
    def story_num(self):
        """Make generation queryable."""
        return cast(self.property3, Integer)

    def _contents(self):
        """Define the contents of new Infos.

        transmit() -> _what() -> create_information() -> _contents().
        """
        stories = [
            "ghosts.md",
            "cricket.md",
            "moochi.md",
            "outwit.md",
            "raid.md",
            "species.md",
            "tennis.md",
            "vagabond.md"
        ]
        story = stories[self.story_num]
        with open("static/stimuli/{}".format(story), "r") as f:
            return f.read()
