```python
class TestClass:
    @classmethod
    def setup_class(cls):
        logger.info("starting class: {} execution".format(cls.__name__))

    @classmethod
    def teardown_class(cls):
        logger.info("teardown class: {} execution".format(cls.__name__))

    def setup_method(self, method):
        logger.info("starting execution of method: {}".format(method.__name__))

    def teardown_method(self, method):
        logger.info("teardown execution of method: {}".format(method.__name__))
```
