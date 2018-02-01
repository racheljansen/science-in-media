from dallinger.nodes import Source
import random
import stories

class WarOfTheGhostsSource(Source):
    """A Source that reads in a random story from a file and transmits it."""

    __mapper_args__ = {
        "polymorphic_identity": "war_of_the_ghosts_source"
    }

    def _contents(self):
        """Define the contents of new Infos.

        transmit() -> _what() -> create_information() -> _contents().
        """
<<<<<<< HEAD:broken-experiment/models.py
        stories = [
            "article1.html",
            "article2.html",
            "article3.html",
            "article4.html",
            "article5.html",
        ]
        story = random.choice(stories)
=======
        story = random.choice(stories.stories)
>>>>>>> origin/working:science-media-dallinger/models.py
        with open("static/stimuli/{}".format(story), "r") as f:
            return f.read()
